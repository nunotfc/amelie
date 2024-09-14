const Datastore = require('nedb');
const logger = require('../config/logger');

const promptsDb = new Datastore({ filename: 'prompts.db', autoload: true });

const setSystemPrompt = (chatId, name, text) => {
    return new Promise((resolve, reject) => {
            const formattedText = `Seu nome é ${name}. ${text}`;
            promptsDb.update({ chatId, name }, { chatId, name, text: formattedText }, { upsert: true }, (err) => {
                if (err) {
                logger.error(`Erro ao definir prompt: ${err.message}`);
                reject(err);
            } else {
                    logger.debug(`Prompt '${name}' definido para chat ${chatId}`);
                    resolve();
                }
            });
        });
};

const getSystemPrompt = (chatId, name) => {
    return new Promise((resolve, reject) => {
            promptsDb.findOne({ chatId, name }, (err, doc) => {
                if (err) {
                logger.error(`Erro ao buscar prompt: ${err.message}`);
                reject(err);
            } else {
                    logger.debug(`Prompt '${name}' recuperado para chat ${chatId}`);
                    resolve(doc);
                }
            });
        });
};

const listSystemPrompts = (chatId) => {
    return new Promise((resolve, reject) => {
            promptsDb.find({ chatId }, (err, docs) => {
                if (err) {
                logger.error(`Erro ao listar prompts: ${err.message}`);
                reject(err);
            } else {
                    logger.debug(`Prompts listados para chat ${chatId}`);
                    resolve(docs);
                }
            });
        });
};

module.exports = {
    setSystemPrompt,
    getSystemPrompt,
    listSystemPrompts
};

