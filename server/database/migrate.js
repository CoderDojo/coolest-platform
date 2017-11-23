const bookshelf = require('./index');

module.exports = () => {
  return new Promise((resolve, reject) => {
    // Default "migrate" will take js files in the ./migrations folder
    bookshelf.knex.migrate.latest({ directory: './server/database/migrations' })
    // No seeding atm
    // .then(() => {
    //   return bookshelf.knex.seed.run();
    // })
    .then(() => {
      console.log('Migrations finished properly');
      resolve();
    });
  });
};
