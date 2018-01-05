const Logentries = require('le_node');
const winston = require('winston');

const logger = new winston.Logger({
  exitOnError: false,
  transports: [],
});

if (process.env.LOGENTRIES_ACCESS_TOKEN) {
  Logentries.provisionWinston(winston);
  logger.add(winston.transports.Logentries, {
    token: process.env.LOGENTRIES_ACCESS_TOKEN,
    handleExceptions: true,
  });
}

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
