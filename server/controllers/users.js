const UserModel = require('../models/user');
const AuthModel = require('../models/auth');
const snakeCase = require('decamelize');

// curl -H 'Content-Type: application/json' -X POST --data-binary '{"email": "a"}' http://localhost:3000/api/v1/users
// TODO : use req.body and apply endpoint validation
class User {
  // TODO: abstract by removing req/res and passing only the userPayload
  static post(payload) {
    return new UserModel(payload)
      .save()
      .then(user =>
        new AuthModel({ userId: user.id, role: 'basic' })
          .save()
          .then(auth => Promise.resolve({ user, auth })))
      .catch((err) => {
        let expectedErr = err;
        if (err.code === '23505' || err.errno === 19) { // TODO : (postgres || sqlite) -> avoid this, really
          // pg's unique_violation
          expectedErr = new Error('User already exists');
          expectedErr.status = 409;
        }
        return Promise.reject(expectedErr);
      });
  }

  static get(identifier, withRelated) {
    return UserModel.forge(identifier)
      .fetch({ withRelated })
      .then(user => Promise.resolve(user ? user.toJSON() : null));
  }

  static getAll(identifier, withRelated) {
    return UserModel.where(identifier)
      .fetchAll({ withRelated })
      .then(users => Promise.resolve(users ? users.toJSON() : []));
  }

  static getExtended(query) {
    const users = new UserModel().platformUsers()
      .query((qb) => {
        Object.keys(query.query).forEach((field) => {
          const value = query.query[field];
          qb.andWhere(snakeCase(field), '=', value);
        });
        qb.andWhere('user.deleted_at', 'IS', null);
      })
      .orderBy(query.orderBy ? snakeCase(query.orderBy) : 'created_at', query.ascending === '1' ? 'asc' : 'desc');
    return users.fetchPage({
      pageSize: query.limit || 25,
      page: query.page || 1,
      withRelated: ['membership'],
    });
  }

  static removeUsers(ids) {
    return UserModel.where('id', 'IN', ids)
      .fetchAll()
      .then(users => Promise.all(users.map(u => u.destroy())));
  }

  static save(payload) {
    return new UserModel(payload).save();
  }
}

module.exports = User;
