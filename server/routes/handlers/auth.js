const Auth = require('../../models/auth');

const get = (req, res) =>
  Auth.where({ user: req.body.id })
    .save()
    .tap(auth => res.status(200).json(auth));

module.exports = {
  get,
};
