const bookshelf = require('../database');
const _ = require('lodash');

const User = bookshelf.Model.extend({
  tableName: 'user',
  hidden: ['_pivot_id', '_pivot_project_id', '_pivot_user_id'],
  project() {
    return this.belongsToMany('Project').through('ProjectUsers');
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
    if (model.attributes && model.attributes.email) {
      model.set('email', model.attributes.email.toLowerCase());
    } else if (model.changed && model.changed.email) {
      model.set('email', model.changed.email.toLowerCase());
    }
  });

  this.on('fetching', (model, columns, opts) => {
    const emailIndex = _.findIndex(opts.query._statements, { column: 'user.email' });
    if (emailIndex >= 0) {
      const email = opts.query._statements[emailIndex];
      email.value = email.value.toLowerCase();
    }
  });

  this.on('fetching:collection', (model, columns, opts) => {
    const emailIndex = _.findIndex(opts.query._statements, { column: 'email' });
    if (emailIndex >= 0) {
      const email = opts.query._statements[emailIndex];
      email.value = email.value.toLowerCase();
    }
  });
  bookshelf.Model.apply(this, args);
}


module.exports = bookshelf.model('User', User);
