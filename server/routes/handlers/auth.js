const Auth = require('../../models/auth');

const get = (req, res, next) => {
  return Auth.where({ user: req.body.id })
  .save()
  .tap(( auth ) => {
    return res.status(200).json(auth);
  });
}

module.exports = {
  get
}
