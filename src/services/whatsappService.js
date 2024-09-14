const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../config/logger');
const { handleTextMessage } = require('../handlers/textHandler');
const { handleCommand } = require('../handlers/commandHandler');
const { handleImageMessage } = require('../handlers/imageHandler');
const { handleDocumentMessage } = require('../handlers/documentHandler');
const { handleLargeAudioMessage, handleSmallAudioMessage, handlePttMessage } = require('../handlers/audioHandler');
const { shouldRespondInGroup } = require('../utils/messageUtils');

const setupWhatsAppClient = () => {
    const client = new Client({
        authStrategy: new LocalAuth()
    });

    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
        logger.info('QR code gerado');
    });

    client.on('ready', () => {
        logger.info('Cliente WhatsApp pronto e conectado');
    });

    client.on('message_create', async (msg) => {
        if (msg.fromMe) return;

        try {
            const chat = await msg.getChat();
            await chat.sendSeen();

            logger.info(`Mensagem recebida: ${msg.author || 'Desconhecido'} / ${msg.from}) -> ${msg.body}`);

            const chatId = chat.id._serialized;

            if (msg.body.startsWith('!')) {
                await handleCommand(msg, chatId);
            } else if (chat.isGroup && !(await shouldRespondInGroup(msg, chat))) {
                logger.info(`Mensagem ignorada em grupo: ${msg.body}`);
            } else if (msg.hasMedia) {
                const attachmentData = await msg.downloadMedia();
                
                if (msg.type === 'audio') {
                    await handleLargeAudioMessage(msg, attachmentData, chatId);
                } else if (msg.type === 'ptt') {
                    await handlePttMessage(msg, attachmentData, chatId);
                } else if (msg.type === 'image' || msg.type === 'sticker') {
                    await handleImageMessage(msg, attachmentData, chatId);
                } else if (msg.type === 'document') {
                    await handleDocumentMessage(msg, chatId);
                }
            } else {
                await handleTextMessage(msg);
            }
        } catch (error) {
            logger.error(`Erro ao processar mensagem: ${error.message}`, { 
                error: error,
                stack: error.stack,
                msgFrom: msg.from,
                msgBody: msg.body
            });
            try {
                await msg.reply('Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.');
            } catch (replyError) {
                logger.error(`Erro ao enviar mensagem de erro: ${replyError.message}`);
            }
        }
    });

    return client;
};

module.exports = {
    setupWhatsAppClient
};
