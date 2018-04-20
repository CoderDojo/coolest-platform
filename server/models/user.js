const bookshelf = require('../database');
const { findIndex } = require('lodash');

const User = bookshelf.Model.extend({
  tableName: 'user',
  hidden: ['_pivot_id', '_pivot_project_id', '_pivot_user_id'],
  project() {
    return this.belongsToMany('Project').through('ProjectUsers');
  },
  platformUsers() {
    return this.query((qb) => {
      qb.leftOuterJoin('auth', 'auth.user_id', 'user.id');
      qb.where(function () {
        this.where('role', '!=', 'admin')
          .orWhere('role', 'IS', null);
      });
    });
  },
  membership() {
    return this.hasMany('ProjectUsers');
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

  function transformEmailToLowerCase(model, columns, opts) {
    const emailIndex = findIndex(
      opts.query._statements,
      statement => statement.column === 'email' || statement.column === 'user.email',
    );
    if (emailIndex >= 0) {
      const email = opts.query._statements[emailIndex];
      email.value = email.value.toLowerCase();
    }
  }

  this.on('fetching', transformEmailToLowerCase);
  this.on('fetching:collection', transformEmailToLowerCase);

  bookshelf.Model.apply(this, args);
}


module.exports = bookshelf.model('User', User);
