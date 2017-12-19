const express = require('express');
const usersApi = require('./api/users');
const projectsApi = require('./api/projects');
const authApi = require('./api/auth');
const eventsApi = require('./api/events');
const pingApi = require('./api/ping');

const router = express.Router();
const apiPrefix = '/api/v1';

usersApi(router, apiPrefix);
authApi(router, apiPrefix);
projectsApi(router, apiPrefix);
eventsApi(router, apiPrefix);
pingApi(router, apiPrefix);

module.exports = router;
