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


  static verify(token) {
    return AuthModel.where({ token })
      .fetch()
      .then((auth) => {
        if (auth) {
          return !!(new AuthModel().verifyToken(token));
        }
        throw new Error('Invalid token');
      });
  }
}

module.exports = Auth;
