const User = require('../../models/user');
const Auth = require('../../models/auth');

// curl -H 'Content-Type: application/json' -X POST --data-binary '{"email": "a"}' http://localhost:3000/api/v1/users
// TODO : use req.body and apply endpoint validation
const post = (req, res) => {
  return new User({ email: req.body.email })
    .save()
    .then(user => new Auth({ userId: user.id })
      .save()
      .then(auth => res.status(200).json({ user, auth })))
    .catch((err) => {
      if (err.code === '23505') {
        // pg's unique_violation
        return res.status(409).json({ status: 409, message: 'User already exists' });
      }
      throw err;
    });
};

module.exports = {
  post,
};
