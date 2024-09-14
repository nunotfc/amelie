const { messagesDb } = require('../database/messagesDb');
const logger = require('../config/logger');

const resetChat = async (chatId) => {
    try {
        await messagesDb.remove({ chatId: chatId }, { multi: true });
        logger.info(`Chat resetado para ${chatId}`);
    } catch (error) {
        logger.error(`Erro ao resetar chat para ${chatId}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    resetChat
};
