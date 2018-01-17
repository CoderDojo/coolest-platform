const bookshelf = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/auth');

const Auth = bookshelf.Model.extend({
  tableName: 'auth',
  user() {
    return this.belongsTo('User');
  },
  hidden: ['password'],
  constructor,
  uuid: true,
  hasTimestamps: true,
  createToken,
  verifyPassword,
  setPassword,
  toJSON,
});

function constructor(...args) {
  bookshelf.Model.apply(this, args);
  this.on('saving', (model) => {
    const token = this.createToken(model.attributes.userId);
    model.attributes.token = token;
  });
}

function toJSON() {
  this.attributes = this.parse(this.attributes);
  return bookshelf.Model.prototype.toJSON.apply(this);
}

//  TODO : find a way to make them static
function createToken(userId) {
  return jwt.sign({ data: userId }, config.authSecret, {
    expiresIn: config.authTimeout,
  });
}

function verifyPassword(password) {
  return bcrypt.compare(password, this.attributes.password);
}

function setPassword(password) {
  return bcrypt.genSalt()
    .then(salt => bcrypt.hash(password, salt))
    .then((hash) => { this.set('password', hash); });
}

Auth.verifyToken = function (token) {
  return jwt.verify(token, config.authSecret, { maxAge: config.authTimeout });
};

module.exports = bookshelf.model('Auth', Auth);
