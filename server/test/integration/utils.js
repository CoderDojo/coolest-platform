const request = require('supertest');

module.exports = (app) => {
  const db = app.app.locals.bookshelf.knex;
  function createProject(token, eventId, payload) {
    if (!payload) {
      // eslint-disable-next-line no-param-reassign
      payload = {
        name: 'MyPoneyProject',
        category: 'HTML',
        users: [
          {
            firstName: 'kid1',
            lastName: 'kido',
            dob: '2008-12-01T20:00.000Z',
            gender: 'male',
            type: 'member',
          },
          {
            firstName: 'orga',
            lastName: 'le',
            dob: '1991-12-01T20:00.000Z',
            gender: 'male',
            email: 'lala@example.com',
            phone: '3538123123123',
            country: 'IE',
            type: 'supervisor',
          },
        ],
      };
    }
    return request(app)
      .post(`/api/v1/events/${eventId}/projects?token=${token}`)
      .send(payload);
  }

  function updateProject(token, eventId, projectId, payload) {
    return request(app)
      .put(`/api/v1/events/${eventId}/projects/${projectId}?token=${token}`)
      .send(payload);
  }

  function getProject(token, eventId, projectId) {
    return request(app)
      .get(`/api/v1/events/${eventId}/projects/${projectId}?token=${token}`);
  }

  function getEvent(slug) {
    return request(app)
      .get(`/api/v1/events/${slug}`);
  }

  function createUser(email, full) {
    return request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({ email })
      .then((res) => {
        if (!full) {
          return Promise.resolve(res.body.auth.token);
        }
        return Promise.resolve(res.body);
      });
  }

  function getAuth(email) {
    return db.raw(`SELECT auth.* FROM auth JOIN user u ON u.id = auth.user_id WHERE u.email = '${email}'`);
  }

  return {
    auth: {
      get: getAuth,
    },
    user: {
      create: createUser,
    },
    event: {
      get: getEvent,
    },
    project: {
      create: createProject,
      update: updateProject,
      get: getProject,
    },
  };
};
