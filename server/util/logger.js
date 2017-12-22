const Logentries = require('le_node');
const winston = require('winston');

const logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true,
      handleExceptions: true,
    }),
  ],
});

if (process.env.LOGENTRIES_ENABLED === 'True') {
  Logentries.provisionWinston(winston);
  logger.add(winston.transports.Logentries, {
    token: process.env.LOGENTRIES_TOKEN,
    handleExceptions: true,
  });
}

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
