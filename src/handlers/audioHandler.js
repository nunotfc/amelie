const { getConfig } = require('../database/configDb');
const { saveChatMessage } = require('../database/messagesDb');
const { prepareGeminiSession, sanitizeResponse } = require('../services/geminiService');
const { sendLongMessage } = require('../utils/messageUtils');
const { uploadToFileManager } = require('../utils/fileUtils');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

const handleLargeAudioMessage = async (msg, audioData, chatId) => {
    try {
        const config = await getConfig(chatId);
        if (config.disableAudio) {
            await msg.reply('O processamento de áudio está desabilitado para este chat.');
            return;
        }

        const tempFilePath = path.join(__dirname, `../../temp_audio_${Date.now()}.mp3`);
        await fs.writeFile(tempFilePath, audioData.data);
        
        const uploadedFile = await uploadToFileManager(tempFilePath, audioData.mimetype);

        const chatSession = await prepareGeminiSession(chatId, "[Áudio grande]", config);
        const result = await chatSession.sendMessage([
            {
                fileData: {
                    mimeType: uploadedFile.file.mimeType,
                    fileUri: uploadedFile.file.uri
                }
            },
            { text: "Por favor, transcreva o áudio e depois resuma o conteúdo em português." }
        ]);

        let response = sanitizeResponse(await result.response.text());
        if (!response || response.trim() === '') {
            response = "Desculpe, ocorreu um erro ao processar o áudio grande. Por favor, tente novamente.";
        }

        await saveChatMessage(chatId, msg.author || msg.from, "[Áudio grande]");
        await saveChatMessage(chatId, config.botName, response);
        await sendLongMessage(msg, response);

        await fs.unlink(tempFilePath);
    } catch (error) {
        logger.error(`Erro ao processar mensagem de áudio grande: ${error.message}`, { error });
        await msg.reply('Desculpe, ocorreu um erro ao processar o áudio grande. Por favor, tente novamente.');
    }
};

const handleSmallAudioMessage = async (msg, audioData, chatId) => {
    // Implementação similar ao handleLargeAudioMessage, mas para áudios pequenos
    // ...
};

const handlePttMessage = async (msg, audioData, chatId) => {
    // Implementação para mensagens de voz (PTT)
    // ...
};

module.exports = {
    handleLargeAudioMessage,
    handleSmallAudioMessage,
    handlePttMessage
};
