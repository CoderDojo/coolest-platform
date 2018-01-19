// server.js
const jsonServer = require('json-server');
const db = require('./db');

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(require('body-parser').json());

server.use(jsonServer.rewriter({
  '/api/v1/events/:eventId/projects/:projectId': '/api/v1/projects/:projectId',
}));

server.post('/api/v1/auth', (req, res) => {
  if (req.body.email === 'existinguser@example.com') {
    res.status(204).send();
  } else {
    res.status(403).send();
  }
});

server.use('/api/v1/users', (req, res, next) => {
  req.body.auth = {
    token: '1234asdf',
  };
  next();
});

server.post('/api/v1/admin/auth', (req, res) => {
  if (req.body.password === 'admin') {
    res.status(200).send({
      token: 'admin_token',
    });
  } else {
    res.status(403).send();
  }
});

server.post('/api/v1/admin/auth/token', (req, res) => {
  if (req.body.token === 'admin_token') {
    res.status(204).send();
  } else {
    res.status(403).send();
  }
});

server.get('/api/v1/events/cp-2018', (req, res) => {
  res.json(db.events[0]);
});

server.use('/api/v1/events/:eventId/projects', (req, res, next) => {
  req.query._sort = req.query.orderBy;
  if (req.query.ascending) {
    req.query._order = req.query.ascending === '0' ? 'desc' : 'asc';
  }
  next();
});

router.render = (req, res) => {
  if (res.locals.data.length) {
    let data = res.locals.data;
    const limitMatch = req.originalUrl.match(/limit=([0-9]+)/);
    const limit = limitMatch ? limitMatch[1] : null;
    const pageMatch = req.originalUrl.match(/page=([0-9]+)/);
    const page = pageMatch ? pageMatch[1] : 1;
    if (limit) {
      data = data.slice((page - 1) * limit, page * limit);
    }
    res.json({
      data,
      count: res.locals.data.length,
    });
  } else {
    res.json(res.locals.data);
  }
};

// server.get('/api/v1/events/:eventId/projects', (req, res) => {
//   res.json({
//     data: res.locals.data,
//     count: res.locals.data.length,
//   });
// });

server.use('/api/v1', router);

server.listen(3000, () => {
  console.log('JSON Server is running');
});
