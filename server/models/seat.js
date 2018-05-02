const bookshelf = require('../database');

const Seat = bookshelf.Model.extend({
  get idAttribute() { return null; },
  tableName: 'projects_seating',
});

module.exports = bookshelf.model('Seat', Seat);
