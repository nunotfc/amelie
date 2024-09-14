const { getChatHistory } = require('../database/messagesDb');
const logger = require('../config/logger');

const getFormattedHistory = async (chatId, config) => {
    const chatHistory = await getChatHistory(chatId);
    
    logger.debug('Histórico bruto do chat:', JSON.stringify(chatHistory, null, 2));

    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
        logger.warn(`Histórico vazio ou inválido para o chat ${chatId}`);
        return '';
    }

    const formattedHistory = chatHistory.map(message => {
        if (!message || typeof message !== 'object') {
            logger.warn(`Mensagem inválida no histórico: ${JSON.stringify(message)}`);
            return null;
        }
        const role = message.sender === config.botName ? config.botName : 'Usuário';
        const text = message.content || 'Conteúdo da mensagem indisponível';
        return `${role}: ${text}`;
    }).filter(Boolean).join('\n');

    logger.debug('Histórico formatado:', formattedHistory);

    return formattedHistory;
};

module.exports = {
    getFormattedHistory
};
