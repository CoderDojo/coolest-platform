const AuthModel = require('../../models/auth');

class Auth {
  static get(userId) {
    return AuthModel.forge({ userId }).fetch();
  }
  static authenticate(jwt, done) {
    Auth.get(jwt.data)
      .then(auth => done(null, auth || false))
      .catch(err => done(null, false));
  }
}

module.exports = Auth;
