const bookshelf = require('../database');
const _ = require('lodash');

const User = bookshelf.Model.extend({
  tableName: 'user',
  project() {
    return this.hasMany('ProjectUsers'); // 'through' ProjectUsers to get Projets seems to be slightly borked when used with 'withRelated'
  },
  auth() {
    return this.hasOne('Auth');
  },
  constructor,
  uuid: true,
  hasTimestamps: true,
});


function constructor(...args) {
  this.on('saving', (model) => {
    if (model.attributes.email) model.set('email', model.attributes.email.toLowerCase());
    if (model.changed.email) model.set('email', model.changed.email.toLowerCase());
  });

  this.on('fetching', (model, columns, opts) => {
    const emailIndex = _.findIndex(opts.query._statements, { column: 'user.email' });
    if (emailIndex >= 0) {
      const email = opts.query._statements[emailIndex];
      email.value = email.value.toLowerCase();
    }
  });
  bookshelf.Model.apply(this, args);
}


module.exports = bookshelf.model('User', User);
