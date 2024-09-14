const { getOrCreateUser } = require('../database/usersDb');
const logger = require('../config/logger');

const listGroupUsers = async (msg) => {
    const chat = await msg.getChat();
    if (chat.isGroup) {
        try {
            const participants = await chat.participants;
            const userList = await Promise.all(participants.map(async (p) => {
                const user = await getOrCreateUser(p.id._serialized, chat);
                return `${user.name} (${p.id.user})`;
            }));
            await msg.reply(`Usuários no grupo:\n${userList.join('\n')}`);
        } catch (error) {
            logger.error(`Erro ao listar usuários do grupo: ${error.message}`, { error });
            await msg.reply('Desculpe, ocorreu um erro ao listar os usuários do grupo.');
        }
    } else {
        await msg.reply('Este comando só funciona em grupos.');
    }
};

module.exports = {
    listGroupUsers
};
