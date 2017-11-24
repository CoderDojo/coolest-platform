const bookshelf = require('../database');

const User = bookshelf.Model.extend({
  tableName: 'user',
  uuid: true,
  hasTimestamps: true,
});

module.exports = User;
