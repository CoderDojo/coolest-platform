const config = require('../config/db.json');
const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);
const bookshelfUuid = require('bookshelf-uuid');
bookshelf.plugin(bookshelfUuid);

module.exports = bookshelf;
