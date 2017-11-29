const bookshelf = require('../database');

const Event = bookshelf.Model.extend({
  tableName: 'event',
  projects() {
    return this.hasMany('Event');
  },
});

module.exports = bookshelf.model('Event', Event);
