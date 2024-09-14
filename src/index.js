const { setupWhatsAppClient } = require('./services/whatsappService');
const logger = require('./config/logger');

const initializeBot = () => {
    const client = setupWhatsAppClient();
    client.initialize();

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', { 
            promise: promise,
            reason: reason,
            stack: reason.stack 
        });
    });

    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error.message}`, { 
            error: error,
            stack: error.stack
        });
        process.exit(1);
    });
};

initializeBot();

module.exports = {
    initializeBot
};
