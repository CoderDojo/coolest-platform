const config = require('../config/db.json');
const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);
const bookshelfUuid = require('bookshelf-uuid');
const bookshelfCamelCase = require('bookshelf-camelcase');

bookshelf.plugin([bookshelfUuid, bookshelfCamelCase, 'registry']);
module.exports = bookshelf;
