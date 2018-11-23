const path = require('path');
const logger = require('../util/logger');
const createAdmin = require('./createAdmin');

module.exports = bookshelf =>
  // Default "migrate" will take js files in the ./migrations folder
  bookshelf.knex.migrate
    .latest({ directory: path.join(__dirname, '/migrations') })
    .then(() => {
      logger.info('Migrations finished properly');
      if (process.env.NODE_ENV !== 'production') {
        return bookshelf.knex.seed.run({ directory: path.join(__dirname, '/seeds') });
      }
    })
    .then(async () => {
      return createAdmin(bookshelf);
    });
