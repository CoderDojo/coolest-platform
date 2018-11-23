const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');
const moment = require('moment');

describe('integration: projects with open event by default', () => {
  let eventId;

  async function getDefaultEvent() {
    await request(app)
      .get('/api/v1/events/cp-2018')
      .then((res) => {
        eventId = res.body.id;
      });
  }

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
    let token;

    before(async () => {
      await setup();
      return Promise.all([
        util.user.create('owner@example.com')
          .then((newToken) => {
            token = newToken;
            return Promise.resolve();
          }),
        getDefaultEvent(),
        util.user.create('updater@example.com')
          .then((ntoken) => {
            _token = ntoken;
            return util.project.create(_token, eventId, project);
          })
          .then((res) => {
            return util.project.get(_token, eventId, res.body.id);
          })
          .then((res) => { refProject = res.body; }),
      ]);
    });
    after(cleanup);

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
          expect(res.body).to.have.all.keys(['name', 'category', 'org', 'orgRef', 'state', 'city', 'description', 'answers', 'id', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'users', 'status']);
          expect(res.body.name).to.be.equal('Self-updated');
          expect(res.body.users.length).to.eql(3);
          const user = res.body.users.find(u => u.id === payload.users[0].id);
          expect(user).to.have.all.keys(['createdAt', 'updatedAt', 'deletedAt', 'id', 'firstName', 'lastName', 'email', 'phone', 'country', 'specialRequirements', 'dob', 'gender']);
          expect(user.firstName).to.be.equal('replaced');
          expect(user.gender).to.be.equal('female');
          expect(user.id).to.be.equal(payload.users[0].id);
          const index = res.body.users.findIndex(u => u.id === refProject.supervisor.id);
          expect(index).to.be.within(0, 3);
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
          const user = res.body.users.find(u => u.id === payload.users[1].id);
          expect(user.email).to.be.equal('updated@example.com');
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
    it('should be disallowed any change if the event is frozen', async () => {
      const payload = project;
      project.id = refProject.id;
      payload.users[0].id = refProject.members[0].id;
      payload.users[1].id = refProject.supervisor.id;
      payload.users[1].email = 'updated@example.com';
      const clock = sinon.useFakeTimers({
        now: moment.utc().add(2, 'day').toDate(),
      });
      // The clock is offset, we need to regen the token
      try {
        await util.user.create('updater@example.com');
      } catch (err) {
        const newToken = (await util.auth.get('updater@example.com')).rows[0].token;
        await util.project.update(newToken, eventId, refProject.id, payload)
          .expect(403)
          .then(() => {
            clock.restore();
          });
      }
    });
    it('should be allow any change if the event is open', async () => {
      const payload = project;
      project.id = refProject.id;
      const clock = sinon.useFakeTimers({
        now: moment.utc().add(1, 'day').set('hours', 0).toDate(),
      });
      // The clock is offset, we need to regen the token
      try {
        await util.user.create('updater@example.com');
      } catch (err) {
        const newToken = (await util.auth.get('updater@example.com')).rows[0].token;
        await util.project.update(newToken, eventId, refProject.id, payload)
          .expect(200)
          .then(() => {
            clock.restore();
          });
      }
    });
  });
});
