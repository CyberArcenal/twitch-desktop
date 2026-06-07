const { sendLog } = require('./handlers/send-log.handler');
const { LogCategory } = require('./handlers/log-category.enum');

module.exports = { sendLog, LogCategory };