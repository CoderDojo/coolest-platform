const config = require('../config/config.json');
const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
