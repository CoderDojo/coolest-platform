const winston = require('winston');
const Logentries = require('./Logentries');

const logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      json: false,
    }),
  ],
});

if (process.env.LOGENTRIES_ENABLED === 'True') {
  logger.add(new Logentries({ token: process.env.LOGENTRIES_TOKEN }));
  logger.exceptions.handle(new Logentries({ token: process.env.LOGENTRIES_TOKEN }));
}

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
