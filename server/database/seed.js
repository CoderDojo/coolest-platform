const path = require('path');

module.exports = (bookshelf) => {
  return bookshelf.knex.seed.run({ directory: path.join(__dirname, '/seeds') });
};
