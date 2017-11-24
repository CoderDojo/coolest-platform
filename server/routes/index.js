const express = require('express');
const usersApi = require('./api/users');

const router = express.Router();

const apiPrefix = '/api/v1';
/* GET home page. */
router.get('/', (req, res, next) => {
  res.send({ status: 'OK' });
});
usersApi(router, apiPrefix);


module.exports = router;
