const bookshelf = require('../database');

const User = bookshelf.Model.extend({
  tableName: 'user',
  project() {
    return this.hasMany('ProjectUsers'); // 'through' ProjectUsers to get Projets seems to be slightly borked when used with 'withRelated'
  },
  auth() {
    return this.hasOne('Auth');
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = bookshelf.model('User', User);
