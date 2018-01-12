const request = require('supertest');

module.exports = (app) => { 
  function createProject(token, eventId, payload) {
    if (!payload) {
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

  function getEvent(slug) {
    return request(app)
      .get(`/api/v1/events/${slug}`);
  }

  return {
    event: {
      get: getEvent,
    },
    project: {
      create: createProject,
    },
  };
};
