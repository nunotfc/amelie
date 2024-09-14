const fs = require('fs').promises;
const path = require('path');
const { fileManager } = require('../services/geminiService');
const logger = require('../config/logger');

const uploadToFileManager = async (filePath, mimeType) => {
    try {
        const uploadedFile = await fileManager.uploadFile(filePath, {
            mimeType: mimeType,
        });
        logger.info(`Arquivo carregado com sucesso: ${filePath}`);
        return uploadedFile;
    } catch (error) {
        logger.error(`Erro ao carregar arquivo: ${error.message}`, { error });
        throw error;
    }
};

const createTempFile = async (prefix, extension, data) => {
    const tempFilePath = path.join(__dirname, `../../temp_${prefix}_${Date.now()}.${extension}`);
    await fs.writeFile(tempFilePath, data);
    return tempFilePath;
};

const removeTempFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        logger.debug(`Arquivo temporário removido: ${filePath}`);
    } catch (error) {
        logger.warn(`Erro ao remover arquivo temporário: ${error.message}`, { filePath });
    }
};

module.exports = {
    uploadToFileManager,
    createTempFile,
    removeTempFile
};
