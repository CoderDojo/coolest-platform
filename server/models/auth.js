const bookshelf = require('../database');
const User = require('./user');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

const Auth = bookshelf.Model.extend({
  tableName: 'auth',
  user: () => this.belongsTo(User),
  constructor,
  uuid: true,
  hasTimestamps: true,
});

function constructor(...args) {
  const token = jwt.sign({ data: args[0].userId }, config.authSecret, {
    expiresIn: config.authTimeout,
  });
  args[0].token = token;
  bookshelf.Model.apply(this, args);
}

module.exports = bookshelf.model('Auth', Auth);
