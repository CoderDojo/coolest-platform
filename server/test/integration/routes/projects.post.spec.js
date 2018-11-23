const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');

describe('/ post', () => {
  let eventId;
  let token;

  async function getDefaultEvent() {
    await request(app)
      .get('/api/v1/events/cp-2018')
      .then((res) => {
        eventId = res.body.id;
      });
  }

  before(async () => {
    await setup();
    return Promise.all([
      util.user.create('owner@example.com')
        .then((_token) => {
          token = _token;
          return Promise.resolve();
        }),
      getDefaultEvent(),
    ]);
  });
  after(cleanup);
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
        expect(res.body).to.have.all.keys(['name', 'category', 'users', 'id', 'created_at', 'updated_at', 'eventId']);
        expect(res.body.users.length).to.eql(2);
        const member = res.body.users.find(u => u.type === 'member');
        expect(member).to.have.all.keys(['created_at', 'updated_at', 'id', 'firstName', 'lastName', 'type', 'dob', 'gender']);
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
      .post(`/api/v1/events/861599a4-ca93-4a87-973f-276766f2a25b/projects?token=${token}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.equal('Event not found');
        expect(res.body.status).to.equal(404);
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
    return util.user.create('meme@example.com')
      .then((_token) => {
        return request(app)
          .post(`/api/v1/events/${eventId}/projects?token=${_token}`)
          .send(payload)
          .expect(200);
      });
  });
});
