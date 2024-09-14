const { getConfig } = require('../database/configDb');
const { saveChatMessage } = require('../database/messagesDb');
const { prepareGeminiSession, sanitizeResponse } = require('../services/geminiService');
const { sendLongMessage } = require('../utils/messageUtils');
const { getFormattedHistory } = require('../utils/historyUtils');
const logger = require('../config/logger');

const handleImageMessage = async (msg, imageData, chatId) => {
    try {
        const config = await getConfig(chatId);
        logger.debug(`Configuração para chat ${chatId}:`, config);
       
        if (config.disableImage) {
            logger.info(`Processamento de imagem desabilitado para chat ${chatId}`);
            await msg.reply('O processamento de imagem está desabilitado para este chat.');
            return;
        }

        if (!imageData || !imageData.data) {
            logger.warn(`Recebido ${msg.type} sem dados válidos`, { msgFrom: msg.from, chatId: chatId });
            await msg.reply(`Desculpe, não foi possível processar este ${msg.type === 'sticker' ? 'sticker' : 'imagem'}. Ele pode ser de um tipo não suportado.`);
            return;
        }

        const userPrompt = msg.body && msg.body.trim() !== '' ? msg.body.trim() : `${msg.type === 'sticker' ? 'Sticker' : 'Imagem'} sem Prompt`;
        const formattedHistory = await getFormattedHistory(chatId, config);

        const imagePart = {
            inlineData: {
                data: imageData.data.toString('base64'),
                mimeType: imageData.mimetype
            }
        };

        const chatSession = await prepareGeminiSession(chatId, userPrompt, config);
        const contentParts = [
            { text: `Histórico da conversa:\n${formattedHistory}\n\nAgora, analise a ${msg.type === 'sticker' ? 'sticker' : 'imagem'} considerando o contexto acima.` },
            imagePart,
            { text: `Prompt do usuário: ${userPrompt}\n\nPor favor, responda ao prompt considerando a ${msg.type === 'sticker' ? 'sticker' : 'imagem'} e o contexto da conversa.` }
        ];

        const result = await chatSession.sendMessage(contentParts);
        const response = sanitizeResponse(await result.response.text());

        if (!response || response.trim() === '') {
            throw new Error('Resposta vazia gerada pelo modelo');
        }

        await sendLongMessage(msg, response);

        await saveChatMessage(chatId, msg.author || msg.from, `[${msg.type === 'sticker' ? 'Sticker' : 'Imagem'}] ${userPrompt}`);
        await saveChatMessage(chatId, config.botName, response);

    } catch (error) {
        logger.error(`Erro ao processar mensagem de ${msg.type === 'sticker' ? 'sticker' : 'imagem'}: ${error.message}`, { 
            error: error,
            stack: error.stack,
            msgFrom: msg.from,
            chatId: chatId
        });
        await msg.reply(`Desculpe, ocorreu um erro ao processar a ${msg.type === 'sticker' ? 'sticker' : 'imagem'}. Por favor, tente novamente.`);
    }
};

module.exports = {
    handleImageMessage
};
