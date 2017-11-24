const bookshelf = require('../database');
const User = require('./user');

const Auth = bookshelf.Model.extend({
  tableName: 'auth',
  user: () => {
    return this.belongsTo(User);
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = Auth;
