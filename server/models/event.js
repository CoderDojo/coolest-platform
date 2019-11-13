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
    return moment(this.attributes.date)
      .tz(this.attributes.tz)
      .format('dddd D MMMM, YYYY');
  },
  constructor,
});

function constructor(...args) {
  this.on('saving', (model) => {
    if (model.attributes && model.attributes.questions) {
      model.set('questions', JSON.stringify(model.attributes.questions));
    } else if (model.changed && model.changed.questions) {
      model.set('questions', JSON.stringify(model.changed.questions));
    }
  });
  bookshelf.Model.apply(this, args);
}

module.exports = bookshelf.model('Event', Event);
