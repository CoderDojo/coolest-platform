const AuthModel = require('../models/auth');

class Auth {
  static get(userId) {
    return AuthModel.forge({ userId }).fetch();
  }

  static authenticate(token, done) {
    Auth.get(token.data)
      .then((auth) => { done(null, auth || false); return null; })
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
