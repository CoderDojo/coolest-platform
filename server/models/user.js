const bookshelf = require('../database');

const User = bookshelf.Model.extend({
  tableName: 'user',
  project() {
    return this.hasMany('Project').through('ProjectUsers');
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = bookshelf.model('User', User);
