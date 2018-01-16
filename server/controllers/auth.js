const AuthModel = require('../models/auth');
const UserModel = require('../models/user');
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
          .then(_auth => Promise.resolve(_auth.toJSON()));
      });
  }

  static adminLogin(email, password, done) {
    // TODO : extract logins system from the controller into the auth handler
    UserModel.where({ email }).fetch({ withRelated: [{ auth: (qb) => { qb.andWhere('auth.role', 'admin'); } }] })
      .then((user) => {
        if (user && user.relations.auth.id) {
          const auth = user.relations.auth;
          auth.verifyPassword(password)
            .then((res) => {
              if (res) {
                return auth.save()
                  .then(_auth => _auth.toJSON());
              }
              return Promise.reject();
            })
            .then((_auth) => {
              return done(null, _auth);
            })
            // TODO: logging here, see :18
            .catch(e => done(null, false));
        } else {
          return done(null, false);
        }
      })
      .catch(e => done(null, false));
  }
}

module.exports = Auth;
