const bookshelf = require('../database');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const User = require('./user');

const Auth = bookshelf.Model.extend({
  tableName: 'auth',
  user: () => this.belongsTo(User),
  constructor,
  uuid: true,
  hasTimestamps: true,
  createToken,
  verifyToken,
});

function constructor(...args) {
  bookshelf.Model.apply(this, args);
  this.on('saving', (model) => {
    const token = this.createToken(model.attributes.userId);
    model.attributes.token = token;
  });
}

//  TODO : find a way to make them static
function createToken(userId) {
  return jwt.sign({ data: userId }, config.authSecret, {
    expiresIn: config.authTimeout,
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.authSecret, { maxAge: config.authTimeout });
}

module.exports = bookshelf.model('Auth', Auth);
