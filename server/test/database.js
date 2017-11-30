const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});
const path = require('path');
const bookshelf = require('bookshelf')(knex);
const bookshelfUuid = require('bookshelf-uuid');
const bookshelfCamelCase = require('bookshelf-camelcase');

const dbPath = path.resolve(`${__dirname}/../database/migrate`);
bookshelf.plugin([bookshelfUuid, bookshelfCamelCase, 'registry']);
// eslint-disable-next-line import/no-dynamic-require
module.exports = require(dbPath)(bookshelf)
  .then(() => bookshelf);
