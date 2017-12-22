const path = require('path');

module.exports = bookshelf =>
  bookshelf.knex.seed.run({ directory: path.join(__dirname, '/seeds') });
