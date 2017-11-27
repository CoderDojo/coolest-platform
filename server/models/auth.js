const bookshelf = require('../database');
const User = require('./user');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

const Auth = bookshelf.Model.extend({
  tableName: 'auth',
  user: () => this.belongsTo(User),
  constructor(...args) {
    const token = jwt.sign({ data: args[0].user_id }, config.authSecret, {
      expiresIn: config.authTimeout,
    });
    args[0].token = token;
    bookshelf.Model.apply(this, args);
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = Auth;
