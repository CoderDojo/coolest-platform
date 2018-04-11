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
      getToken('owner@example.com')
        .then((_token) => {
          token = _token;
          return Promise.resolve();
        }),
      getDefaultEvent(),
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

  async function getDefaultEvent() {
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
            email: 'owner@example.com',
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
            email: 'owner@example.com',
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
            email: 'owner@example.com',
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

  describe('/:id PUT', () => {
    const project = {
      name: 'Self-overwriting-project',
      category: 'Hardware',
      users: [
        {
          firstName: 'replaceable',
          lastName: 'Kid',
          dob: '2008-12-01T20:00.000Z',
          gender: 'male',
          type: 'member',
        },
        {
          firstName: 'exchangeable',
          lastName: 'orga',
          dob: '1991-12-01T20:00.000Z',
          gender: 'male',
          email: 'updatable@example.com',
          phone: '3538123123123',
          country: 'IE',
          type: 'supervisor',
        },
      ],
    };
    let refProject;
    let _token;

    before(() => {
      return util.user.create('updater@example.com')
        .then((ntoken) => {
          _token = ntoken;
          return util.project.create(_token, eventId, project);
        })
        .then((res) => {
          return util.project.get(_token, eventId, res.body.id);
        })
        .then((res) => { refProject = res.body; });
    });

    it('should update a project (same struct)', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.name = 'Self-updated';
      payload.users[0].id = refProject.members[0].id;
      payload.users[0].firstName = 'replaced';
      payload.users[0].gender = 'female';
      payload.users[1].id = refProject.supervisor.id;
      await util.project.update(_token, eventId, refProject.id, payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.all.keys(['name', 'category', 'org', 'orgRef', 'description', 'answers', 'id', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'users']);
          expect(res.body.name).to.be.equal('Self-updated');
          expect(res.body.users.length).to.eql(3);
          expect(res.body.users[0]).to.have.all.keys(['createdAt', 'updatedAt', 'id', 'firstName', 'lastName', 'email', 'phone', 'country', 'specialRequirements', 'dob', 'gender']);
          expect(res.body.users[0].firstName).to.be.equal('replaced');
          expect(res.body.users[0].gender).to.be.equal('female');
          expect(res.body.users[0].id).to.be.equal(payload.users[0].id);
          expect(res.body.users[1].id).to.be.equal(payload.users[1].id);
        });
    });

    it('should be requiring a valid auth (owner)', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.users[0].id = refProject.members[0].id;
      payload.users[1].id = refProject.supervisor.id;
      await util.project.update(token, eventId, refProject.id, payload)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('should allow change of emails', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.users[0].id = refProject.members[0].id;
      payload.users[1].id = refProject.supervisor.id;
      payload.users[1].email = 'updated@example.com';
      await util.project.update(_token, eventId, refProject.id, payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.users.length).to.eql(3);
          expect(res.body.users[1].email).to.be.equal('updated@example.com');
          expect(res.body.users[1].id).to.be.equal(payload.users[1].id);
        });
    });
    it('should allow adding of users', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.users[0].id = refProject.members[0].id;
      payload.users[1].id = refProject.supervisor.id;
      payload.users[2] = {
        firstName: 'freshAsNew',
        lastName: 'Kid',
        dob: '2008-12-01T20:00.000Z',
        gender: 'other',
        type: 'member',
      };
      await util.project.update(_token, eventId, refProject.id, payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.users.length).to.eql(4);
          const newKid = res.body.users.find(u => u.firstName === payload.users[2].firstName);
          expect([payload.users[0].id, payload.users[1].id]).to.not.include(newKid.id);
        });
    });
    it('should allow removal of users', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.users.shift();
      await util.project.update(_token, eventId, refProject.id, payload)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          // original kid are deleted,
          // only the owner and the supervisor are left
          expect(res.body.users.length).to.equal(3);
        });
    });
  });

  describe('/:id patch', () => {
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

  describe('/users/:uId/projects GET', () => {
    let userId;
    let refProject;
    let refToken;
    before(() => {
      return util.user.create('listuserprojects@example.com', true)
        .then((res) => {
          userId = res.user.id;
          refToken = res.auth.token;
        })
        .then(() => util.project.create(refToken, eventId))
        .then((res) => { refProject = res.body; });
    });
    it('should return the user projects', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${refToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).to.equal(1);
          expect(res.body.count).to.equal(1);
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(Object.keys(res.body.data[0])).to.eql(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'owner', 'supervisor', 'members']);
          expect(Object.keys(res.body.data[0].owner)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(Object.keys(res.body.data[0].supervisor)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(Object.keys(res.body.data[0].members[0])).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(refProject.id).to.equal(res.body.data[0].id);
          expect(res.body.data[0].owner.id).to.be.equal(userId);
        });
    });
    it('should return multiple projects', async () => {
      await util.project.create(refToken, eventId)
        .then(() => {
          return request(app)
            .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${refToken}`)
            .expect(200)
            .then((res) => {
              expect(res.body.data.length).to.equal(2);
              expect(res.body.count).to.equal(2);
              expect(Object.keys(res.body)).to.eql(['data', 'count']);
              expect(Object.keys(res.body.data[0])).to.eql(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'owner', 'supervisor', 'members']);
              expect(Object.keys(res.body.data[0].owner)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
              expect(Object.keys(res.body.data[0].supervisor)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
              expect(Object.keys(res.body.data[0].members[0])).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
              expect(res.body.data[0].owner.id).to.be.equal(userId);
              expect(res.body.data[1].owner.id).to.be.equal(userId);
              expect(res.body.data[1].id).to.not.be.equal(res.body.data[0].id);
            });
        });
    });
    it('should not return someone else projects list', async () => {
      await util.user.create('listanotheruserprojects@example.com')
        .then((_refToken) => {
          return request(app)
            .get(`/api/v1/events/${eventId}/users/${userId}/projects?token=${_refToken}`)
            .expect(200)
            .then((res) => {
              expect(res.body.data.length).to.equal(0);
              expect(res.body.count).to.equal(0);
            });
        });
    });
  });

  describe('/ GET', () => {
    let refAuth;
    let firstTenProjects;
    const count = 55;
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
          expect(res.body.count).to.equal(count);
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(Object.keys(res.body.data[0])).to.eql(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'owner', 'supervisor', 'members']);
          expect(Object.keys(res.body.data[0].owner)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(Object.keys(res.body.data[0].supervisor)).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
          expect(Object.keys(res.body.data[0].members[0])).to.eql(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt']);
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
          expect(res.body.count).to.equal(count);
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
          expect(res.body.count).to.equal(count);
          expect(res.body.data.length).to.equal(10);
          expect(res.body.data).not.to.be.eql(firstTenProjects);
          expect(res.body.data.map(project => project.name))
            .not.to.be.eql(firstTenProjects.map(project => project.name));
        });
    });
    it('should order the list depending on query', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=20&orderBy=name&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(count);
          expect(res.body.data.length).to.equal(20);
          expect(res.body.data[0].name).to.be.eql('Self-updated');
        });
    });
    it('should allow ordering by subqueries values (owner)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&orderBy=owner.email&ascending=1&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(count);
          // TODO : better define a project just for this one
          // which starts with '0aaaa' to ensure the test always passes
          expect(res.body.data[0].owner.email).to.be.eql('listuserprojects@example.com');
          expect(res.body.data[0].name).to.be.eql('MyPoneyProject');
        });
    });
    it('should allow ordering by subqueries values (supervisor)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(count);
          expect(res.body.data.length).to.equal(50);
          expect(res.body.data[0].supervisor.email).to.be.eql('updated@example.com');
          expect(res.body.data[0].name).to.be.eql('Self-updated');
        });
    });
    it('should allow filtering', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=Project1&ascending=0&token=${refAuth.token}`)
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
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[supervisor.email]=test1&ascending=0&token=${refAuth.token}`)
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
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=MyPoneyProject&query[supervisor.email]=another&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Project with supervisor from prev test
          expect(res.body.count).to.equal(1);
          expect(res.body.data.length).to.equal(1);
        });
    });
    it('should ignore empty filters', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[category]=&query[name]=MyPoneyProject&query[supervisor.email]=another&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Project with supervisor from prev test
          expect(res.body.count).to.equal(1);
          expect(res.body.data.length).to.equal(1);
        });
    });
    it('should support camelCase names', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&orderBy=supervisor.createdAt&query[createdAt]=2018-01-01&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          // Project with supervisor from prev test
          expect(res.body.count).to.equal(0);
          expect(res.body.data.length).to.equal(0);
        });
    });
    it('should be covered by admin token', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?token=${token}`)
        .expect(403);
    });

    describe('with csv format', () => {
      it('should return a csv', async () => {
        await request(app)
          .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[supervisor.email]=test1&format=csv&ascending=false&token=${refAuth.token}`)
          .expect(200)
          .then((res) => {
            expect(res.text).not.to.be.empty;
            const lines = res.text.split('\n');
            expect(lines.length).to.equal(12); // 10-19 + 1 + headers
            const columns = lines[0].split(',');
            const row = lines[1].split(',');
            expect(columns).to.eql(['"Name"', '"Description"', '"Category"', '"Supervisor Email"', '"Owner Email"', '"Created At"', '"Updated At"']);
            expect(row[row.length - 1]).to.eql(`"${new Date(Date.now()).toLocaleDateString()}"`);
          });
      });
      it('should return an empty csv with headers', async () => {
        await request(app)
          .get(`/api/v1/events/${eventId}/projects?limit=50&query[supervisor.email]=doubidou&format=csv&ascending=false&token=${refAuth.token}`)
          .expect(200)
          .then((res) => {
            expect(res.text).not.to.be.empty;
            const lines = res.text.split('\n');
            expect(lines.length).to.equal(1); // headers
            const columns = lines[0].split(',');
            expect(columns).to.eql(['"Name"', '"Description"', '"Category"', '"Supervisor Email"', '"Owner Email"', '"Created At"', '"Updated At"']);
          });
      });
    });
  });

  after(() => {
    app.close();
  });
});
