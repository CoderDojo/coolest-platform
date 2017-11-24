const User = require('../../models/user');

const post = ( req, res, next ) => {
  return new User({ email: req.body.email })
  .save()
  .then(( user ) => {
    return res.status(200).json(user);
  })
  .catch((err) => {
    if (err.code === '23505') { // pg's unique_violation
      return res.status(409).json({ status: 409, message: 'User already exists' });
    } else {
      throw err;
    }
  })
}

module.exports = {
  post
}
