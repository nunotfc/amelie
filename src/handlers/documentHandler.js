const { getConfig } = require('../database/configDb');
const { saveChatMessage } = require('../database/messagesDb');
const { prepareGeminiSession, sanitizeResponse } = require('../services/geminiService');
const { sendLongMessage } = require('../utils/messageUtils');
const { uploadToFileManager } = require('../utils/fileUtils');
const { getFormattedHistory } = require('../utils/historyUtils');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

const handleDocumentMessage = async (msg, chatId) => {
    try {
        const config = await getConfig(chatId);
        if (config.disableDocument) {
            await msg.reply('O processamento de documentos está desabilitado para este chat.');
            return;
        }

        const documentData = await msg.downloadMedia();
        if (!documentData || !documentData.data) {
            logger.warn(`Recebido documento sem dados válidos`, { msgFrom: msg.from, chatId: chatId });
            await msg.reply('Desculpe, não foi possível processar este documento. Ele pode ser de um tipo não suportado.');
            return;
        }

        const fileName = documentData.filename || 'documento_sem_nome';
        let mimeType = documentData.mimetype || mime.lookup(fileName) || 'application/octet-stream';

        const supportedMimeTypes = [
            'text/plain', 'text/html', 'text/css', 'text/javascript',
            'text/markdown', 'application/json', 'application/xml', 'application/pdf',
            'image/png', 'image/jpeg', 'image/gif', 'image/webp'
        ];

        if (!supportedMimeTypes.includes(mimeType)) {
            logger.warn(`Tipo MIME não suportado: ${mimeType}`, { msgFrom: msg.from, chatId: chatId });
            await msg.reply(`Desculpe, o tipo de documento (${mimeType}) não é suportado para análise.`);
            return;
        }

        const tempFilePath = path.join(__dirname, `../../temp_doc_${Date.now()}_${fileName}`);
        await fs.writeFile(tempFilePath, documentData.data, 'base64');

        const uploadedFile = await uploadToFileManager(tempFilePath, mimeType);

        const chatSession = await prepareGeminiSession(chatId, `[Documento: ${fileName}]`, config);
        const formattedHistory = await getFormattedHistory(chatId, config);

        const result = await chatSession.sendMessage([
            { text: `Histórico da conversa:\n${formattedHistory}\n\nAgora, analise o documento anexado considerando o contexto acima.` },
            {
                fileData: {
                    mimeType: uploadedFile.file.mimeType,
                    fileUri: uploadedFile.file.uri
                }
            },
            { text: `Por favor, analise o conteúdo do documento "${fileName}" (tipo: ${mimeType}) e forneça um resumo detalhado.` }
        ]);

        let response = sanitizeResponse(await result.response.text());
        if (!response || response.trim() === '') {
            throw new Error('Resposta vazia gerada pelo modelo');
        }

        await sendLongMessage(msg, response);

        await saveChatMessage(chatId, msg.author || msg.from, `[Documento: ${fileName}]`);
        await saveChatMessage(chatId, config.botName, response);

        await fs.unlink(tempFilePath);

    } catch (error) {
        logger.error(`Erro ao processar mensagem de documento: ${error.message}`, { 
            error: error,
            stack: error.stack,
            msgFrom: msg.from,
            chatId: chatId
        });
        await msg.reply('Desculpe, ocorreu um erro ao processar o documento. Por favor, tente novamente ou verifique se o tipo de documento é suportado.');
    }
};

module.exports = {
    handleDocumentMessage
};
