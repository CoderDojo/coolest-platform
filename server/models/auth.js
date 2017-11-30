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
  bookshelf.Model.apply(this, args);
  this.on('saving', (model) => {
    const token = jwt.sign({ data: model.attributes.userId }, config.authSecret, {
      expiresIn: config.authTimeout,
    });
    model.attributes.token = token;
  });
}

module.exports = bookshelf.model('Auth', Auth);
