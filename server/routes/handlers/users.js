const UserModel = require('../../models/user');
const AuthModel = require('../../models/auth');

// curl -H 'Content-Type: application/json' -X POST --data-binary '{"email": "a"}' http://localhost:3000/api/v1/users
// TODO : use req.body and apply endpoint validation
class User {
  // TODO: abstract by removing req/res and passing only the userPayload
  static post(req, res, next) {
    return new UserModel({ email: req.body.email })
      .save()
      .then(user =>
        new AuthModel({ userId: user.id })
          .save()
          .then(auth => res.status(200).json({ user, auth })))
      .catch((err) => {
        let expectedErr = new Error('Error while saving a user.');
        if (err.code === '23505') {
          // pg's unique_violation
          expectedErr = new Error('User already exists');
          expectedErr.status = 409;
        }
        next(expectedErr);
      });
  }

  static get(identifier) {
    return new UserModel().where(identifier)
      .fetch();
  }
}

module.exports = User;
