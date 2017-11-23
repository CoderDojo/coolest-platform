const bookshelf = require('./index');
const logger = require('../util/logger');

module.exports = () =>
  new Promise((resolve, reject) => {
    // Default "migrate" will take js files in the ./migrations folder
    bookshelf.knex.migrate
      .latest({ directory: './server/database/migrations' })
      // No seeding atm
      // .then(() => {
      //   return bookshelf.knex.seed.run();
      // })
      .then(() => {
        logger.info('Migrations finished properly');
        resolve();
      })
      .catch(reject);
  });
