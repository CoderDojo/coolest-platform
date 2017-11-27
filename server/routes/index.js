const express = require('express');
const usersApi = require('./api/users');
const authApi = require('./api/auth');

const router = express.Router();

const apiPrefix = '/api/v1';
usersApi(router, apiPrefix);
authApi(router, apiPrefix);

module.exports = router;
