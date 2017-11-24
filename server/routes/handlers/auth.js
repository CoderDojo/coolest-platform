const Auth = require('../../models/auth');

const post = (req, res, next) => {
  return new Auth({ user: req.body.id })
  .save()
  .tap(( auth ) => {
    return res.status(200).json(auth);
  });
}

module.exports = {
  post
}
