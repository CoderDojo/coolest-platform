const bookshelf = require('../database');

const Event = bookshelf.Model.extend({
  tableName: 'event',
});

module.exports = Event;
