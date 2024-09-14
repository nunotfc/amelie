require('dotenv').config();

module.exports = {
	    API_KEY: process.env.API_KEY,
	    MAX_HISTORY: parseInt(process.env.MAX_HISTORY || '1000'),
	    BOT_NAME: process.env.BOT_NAME || 'Amelie'
};
