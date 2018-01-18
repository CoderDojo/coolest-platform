const request = require('supertest');
const proxy = require('proxyquire');
const dbConfig = require('../../config/db.js');
const seeder = require('../../database/seed');
const utils = require('../utils');

dbConfig['@global'] = true;
dbConfig['@noCallThru'] = true;
describe('integration: projects', () => {
  let app;
  let token;
  let eventId;
  let projectId;
  let util;

  before(async () => {
    app = await proxy(
      '../../../bin/www',
      {
        '../config/db.json': dbConfig,
        '../database/seed': seeder,
      },
    )({ seed: true });
    util = utils(app);
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

  describe('/ post', () => {
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
  describe('/:id put', () => {
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

  describe('/ GET', () => {
    let refAuth;
    let firstTenProjects;
    before(() => {
      return Promise.all([
        util.auth.get('hello@coolestprojects.org')
          .then((res) => {
            refAuth = res[0];
          }),
        (() => {
          const proms = [];
          for (let i = 0; i < 50; i += 1) {
            const prom = util.user.create(`test${i}@test.com`)
              // eslint-disable-next-line no-loop-func
              .then(_token => util.project.create(_token, eventId, {
                name: `MyPoneyProject${i}`,
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
                    email: `test${i}@example.com`,
                    phone: '3538123123123',
                    country: 'IE',
                    type: 'supervisor',
                  },
                ],
              }));
            proms.push(prom);
          }
          return Promise.all(proms);
        })(),
      ]);
    });

    it('should return by default a list of 25 projects ordered by creation date desc', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          // Content
          expect(res.body.count).to.equal(52);
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(Object.keys(res.body.data[0])).to.eql(['id', 'name', 'category', 'createdAt', 'updatedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'owner', 'supervisor']);
          expect(Object.keys(res.body.data[0].owner)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(Object.keys(res.body.data[0].supervisor)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          // Ordering
          expect(res.body.data.length).to.equal(25);
          expect(res.body.data[0].name).to.eql('MyPoneyProject49');
        });
    });

    it('should return a list of 10 projects when provided a limit', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(52);
          expect(res.body.data.length).to.equal(10);
          firstTenProjects = res.body.data;
        });
    });

    it('should return a list of 10 projects different on page 2 when provided a limit and a page', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&page=2&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(52);
          expect(res.body.data.length).to.equal(10);
          expect(res.body.data).not.to.be.eql(firstTenProjects);
          expect(res.body.data.map(project => project.name))
            .not.to.be.eql(firstTenProjects.map(project => project.name));
        });
    });
    it('should order the list depending on query', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=20&orderBy=name&ascending=false&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(52);
          expect(res.body.data.length).to.equal(20);
          expect(res.body.data[0].name).to.be.eql('MyPoneyProject9');
        });
    });
    it('should allow ordering by subqueries values (owner)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&orderBy=owner.email&ascending=true&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(52);
          expect(res.body.data[0].owner.email).to.be.eql('me@example.com');
          expect(res.body.data[0].name).to.be.eql('MyPoneyProject');
        });
    });
    it('should allow ordering by subqueries values (supervisor)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&ascending=false&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(52);
          expect(res.body.data.length).to.equal(50);
          expect(res.body.data[0].supervisor.email).to.be.eql('test9@example.com');
          expect(res.body.data[0].name).to.be.eql('MyPoneyProject9');
        });
    });
    it('should allow filtering', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=Project1&ascending=false&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Project from 1 to 10-19
          expect(res.body.count).to.equal(11);
          expect(res.body.data.length).to.equal(11);
        });
    });
    it('should allow filtering from sub-orgs', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[supervisor.email]=test1&ascending=false&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Emails from 1 to 10-19
          expect(res.body.count).to.equal(11);
          expect(res.body.data.length).to.equal(11);
        });
    });
    it('should allow multiple filtering', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=MyPoneyProject&query[supervisor.email]=another&ascending=false&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Project with supervisor from prev test
          expect(res.body.count).to.equal(1);
          expect(res.body.data.length).to.equal(1);
        });
    });
    it('should be covered by admin token', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?token=${token}`)
        .expect(403);
    });
  });

  after(() => {
    app.close();
  });
});
