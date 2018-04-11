const bookshelf = require('../database');
const moment = require('moment-timezone');

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
  formattedDate() {
    return moment(this.attributes.date).tz(this.attributes.tz).format('dddd [the] Do [of] MMMM');
  },
});

module.exports = bookshelf.model('Event', Event);
