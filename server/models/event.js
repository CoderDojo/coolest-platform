const bookshelf = require('../database');
const moment = require('moment');

const Event = bookshelf.Model.extend({
  tableName: 'event',
  projects() {
    return this.hasMany('Event');
  },
  isOpen() {
    return moment.utc(this.attributes.registrationEnd) > moment.utc();
  },
  isFrozen() {
    return moment.utc(this.attributes.freezeDate) < moment.utc();
  },
});

module.exports = bookshelf.model('Event', Event);
