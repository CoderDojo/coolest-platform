const AuthModel = require('../models/auth');
const { isEmpty } = require('lodash');

class Auth {
  static get(userId) {
    return AuthModel.forge({ userId }).fetch({ withRelated: ['user'] });
  }

  static authenticate(token, done) {
    Auth.get(token.data)
      .then((auth) => {
        if (!isEmpty(auth)) {
          return done(null, auth.toJSON());
        }
        return done(null, false);
      })
      // TODO : find a way to inject app so we can log the fuck out of those
      .catch(err => done(null, false));
  }

  static verify(token, role) {
    return AuthModel.where({ token, role })
      .fetch()
      .then((auth) => {
        if (auth) {
          return !!AuthModel.verifyToken(token);
        }
        throw new Error('Invalid token');
      });
  }

  static refresh(id) {
    return AuthModel.where({ id })
      .fetch()
      .then((auth) => {
        return auth.save()
          // Ugly workaround for https://github.com/bookshelf/bookshelf/issues/1076
          .then(_auth => _auth.parse(_auth.attributes))
          .then(_auth => Promise.resolve(_auth));
      });
  }
}

module.exports = Auth;
