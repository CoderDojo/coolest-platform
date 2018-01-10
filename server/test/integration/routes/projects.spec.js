const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe('integration: users', () => {
  let app;
  let token;
  let eventId;
  let projectId;

  before(async () => {
    app = await proxy(
      '../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    return Promise.all([
      getToken('me@example.com')
        .then((_token) => {
          token = _token;
          return Promise.resolve();
        }),
      getDefaultProject(),
    ]);
  });

  async function getToken(email) {
    return request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({ email })
      .then((res) => {
        return Promise.resolve(res.body.auth.token);
      });
  }

  async function getDefaultProject() {
    await request(app)
      .get('/api/v1/events/cp-2018')
      .then((res) => {
        eventId = res.body.id;
      });
  }

  describe('post', () => {
    it('should create a project', async () => {
      const payload = {
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
            email: 'me@example.com',
            phone: '3538123123123',
            country: 'IE',
            type: 'supervisor',
          },
        ],
      };
      return request(app)
        .post(`/api/v1/events/${eventId}/projects?token=${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          projectId = res.body.id;
          expect(res.body).to.have.all.keys(['name', 'category', 'users', 'id', 'created_at', 'updated_at', 'eventId']);
          expect(res.body.users.length).to.eql(2);
          expect(res.body.users[0]).to.have.all.keys(['created_at', 'updated_at', 'id', 'firstName', 'lastName', 'type', 'dob', 'gender']);
        });
    });

    it('should return an error when the eventId is invalid', async () => {
      const payload = {
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
            email: 'me@example.com',
            phone: '3538123123123',
            country: 'IE',
            type: 'supervisor',
          },
        ],
      };
      return request(app)
        .post(`/api/v1/events/aaa/projects?token=${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body.msg).to.equal('Error while saving your project.');
          expect(res.body.status).to.equal(500);
        });
    });

    it('should be requiering a valid auth', async () => {
      const payload = {
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
            email: 'me@example.com',
            phone: '3538123123123',
            country: 'IE',
            type: 'supervisor',
          },
        ],
      };
      return request(app)
        .post(`/api/v1/events/${eventId}/projects?token=aaa`)
        .send(payload)
        .expect(401);
    });

    it('should be allowing an email different for creator/supervisor', async () => {
      const payload = {
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
            email: 'another@example.com',
            phone: '3538123123123',
            country: 'IE',
            type: 'supervisor',
          },
        ],
      };
      return getToken('meme@example.com')
        .then((_token) => {
          return request(app)
            .post(`/api/v1/events/${eventId}/projects?token=${_token}`)
            .send(payload)
            .expect(200);
        });
    });
  });
  describe('put', () => {
    it('should allow update of a project', async () => {
      const payload = {
        name: 'MyPoneyProject',
        answers: { social_project: true },
      };
      return request(app)
        .patch(`/api/v1/events/${eventId}/projects/${projectId}?token=${token}`)
        .send(payload)
        .expect(200);
    });
    it('should fail if user is not the owner', async () => {
      const payload = {
        name: 'MyPoneyProject',
        answers: { social_project: true },
      };
      return getToken('anotherone@example.com')
        .then((_token) => {
          return request(app)
            .patch(`/api/v1/events/${eventId}/projects/${projectId}?token=${_token}`)
            .send(payload)
            .expect(403)
            .then((res) => {
              expect(res.body.msg).to.equal('Forbidden');
            });
        });
    });
  });

  after(() => {
    app.close();
  });
});
