const Datastore = require('nedb');
const logger = require('../config/logger');

const messagesDb = new Datastore({ filename: 'messages.db', autoload: true });

const saveChatMessage = (chatId, sender, message) => {
    return new Promise((resolve, reject) => {
            messagesDb.insert({
                chatId,
                sender,
                content: message,
                timestamp: Date.now()
            }, (err) => {
                if (err) {
                logger.error(`Erro ao salvar mensagem: ${err.message}`);
                reject(err);
            } else {
                    logger.debug(`Mensagem salva para chat ${chatId}`);
                    resolve();
                }
            });
        });
};

const getChatHistory = (chatId, limit) => {
    return new Promise((resolve, reject) => {
            messagesDb.find({ chatId: chatId })
                .sort({ timestamp: 1 })
                .limit(limit)
                .exec((err, docs) => {
                if (err) {
                    logger.error(`Erro ao buscar histórico: ${err.message}`);
                    reject(err);
                } else {
                    logger.debug(`Histórico recuperado para chat ${chatId}`);
                    resolve(docs);
                }
            });
        });
};

module.exports = {
    saveChatMessage,
    getChatHistory
};
