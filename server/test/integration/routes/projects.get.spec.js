const { setup, cleanup } = require('../../setup-db');
const request = require('supertest');

describe('integration: projects with open event by default', () => {
  let eventId;

  async function getDefaultEvent() {
    await request(app)
      .get('/api/v1/events/cp-2018')
      .then((res) => {
        eventId = res.body.id;
      });
  }

  describe('/ GET', () => {
    let refAuth;
    let firstTenProjects;
    let token;
    const count = 110;
    before(async () => {
      await setup();
      await getDefaultEvent();
      refAuth = (await util.auth.get('hello@coolestprojects.org')).rows[0];
      token = (await util.user.create('dummy@sink.sendgrid.net'));
    });
    after(cleanup);

    it('should return by default a list of 25 projects ordered by creation date desc', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          // Content
          expect(res.body.count).to.equal(count);
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.data[0]).to.have.all.keys(['id', 'name', 'category', 'createdAt', 'updatedAt', 'deletedAt', 'eventId', 'description', 'answers', 'org', 'orgRef', 'state', 'city', 'owner', 'supervisor', 'members', 'status']);
          expect(res.body.data[0].owner).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          expect(res.body.data[0].supervisor).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          expect(res.body.data[0].members[0]).to.have.all.keys(['id', 'firstName', 'lastName', 'dob', 'gender', 'specialRequirements', 'email', 'phone', 'country', 'createdAt', 'updatedAt', 'deletedAt']);
          // Ordering
          expect(res.body.data.length).to.equal(25);
          // Project order creation is not deterministic
          expect(res.body.data[0].name).to.match(/Test Project 1../);
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
          expect(res.body.data[0].name).to.be.eql('Test Project 99');
        });
    });
    it('should allow ordering by subqueries values (owner)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&orderBy=owner.email&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(count);
          // TODO : better define a project just for this one
          // which starts with '0aaaa' to ensure the test always passes
          expect(res.body.data[0].owner.email).to.be.eql('testowner9@sink.sendgrid.net');
          expect(res.body.data[0].name).to.be.eql('Test Project 9');
        });
    });
    it('should allow ordering by subqueries values (supervisor)', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&ascending=1&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(count);
          expect(res.body.data.length).to.equal(50);
          expect(res.body.data[0].supervisor.email).to.be.eql('testsupervisor100@sink.sendgrid.net');
          expect(res.body.data[0].name).to.be.eql('Test Project 100');
        });
    });
    it('should allow filtering', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=Test%20Project 9&ascending=0&token=${refAuth.token}`)
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
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[supervisor.email]=testsupervisor1&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(22);
          expect(res.body.data.length).to.equal(22);
        });
    });
    it('should allow multiple filtering', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[name]=Test%20Project&query[supervisor.email]=testsupervisor1&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(22);
          expect(res.body.data.length).to.equal(22);
        });
    });
    it('should ignore empty filters', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[category]=&query[name]=Test%Project&query[supervisor.email]=testsupervisor1&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(22);
          expect(res.body.data.length).to.equal(22);
        });
    });
    it('should support camelCase names', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=10&orderBy=supervisor.createdAt&query[orgRef]=choubidou&ascending=0&token=${refAuth.token}`)
        .expect(200)
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(['data', 'count']);
          expect(res.body.count).to.equal(0);
          expect(res.body.data.length).to.equal(0);
        });
    });
    it('should be covered by admin token', async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?token=${token}`)
        .expect(403);
    });

    it("shouldn't include deleted projects", async () => {
      await request(app)
        .get(`/api/v1/events/${eventId}/projects?limit=1&token=${refAuth.token}`)
        .expect(200)
        .then(async (res) => {
          const lastProject = res.body.data[0];
          await util.project.delete(refAuth.token, eventId, lastProject);
          await request(app)
            .get(`/api/v1/events/${eventId}/projects?limit=1&token=${refAuth.token}`)
            .expect(200)
            .then((r) => {
              expect(r.body.data[0].id).to.not.equal(lastProject.id);
            });
        });
    });
    describe('with csv format', () => {
      const projectCSVColumns = [
        '"Project name"',
        '"Description"',
        '"Category"',
        '"City"',
        '"State"',
        '"Owner Email"',
        '"Seat"',
        '"Status"',
        '"Created At"',
        '"Updated At"',
        '"Supervisor First Name"',
        '"Supervisor Last Name"',
        '"Supervisor Email"',
        '"Supervisor Phone"',
        '"Social project"',
        '"Educational project"',
        '"Innovator stage"',
      ];

      const csvColumnsWithParticipant = projectCSVColumns.concat([
        '"Participant 1 First Name"',
        '"Participant 1 Last Name"',
        '"Participant 1 Dob"',
        '"Participant 1 Gender"',
        '"Participant 1 Special requirements"',
      ]);
      const userCSVColumns = ['"Project ID", "First name"', '"Last name"', '"Dob"', '"Gender"', '"Special requirements"'].concat(projectCSVColumns);
      it('should return a csv', async () => {
        await request(app)
          .get(`/api/v1/events/${eventId}/projects?limit=50&orderBy=supervisor.email&query[supervisor.email]=testsupervisor1&format=csv&ascending=false&token=${
            refAuth.token
          }`)
          .expect(200)
          .then((res) => {
            expect(res.text).not.to.be.empty;
            const lines = res.text.split('\n');
            // 1 + 10-19 + 100-110 + 1 + headers due to supervisor email filtering
            expect(lines.length).to.equal(22);
            const columns = lines[0].split(',');
            const row = lines[1].split(',');
            expect(columns).to.eql(csvColumnsWithParticipant);
            expect(row[row.length - 13]).to.eql(`"${new Date(Date.now()).toLocaleDateString()}"`);
          });
      });
      it('should return an empty csv with headers', async () => {
        await request(app)
          .get(`/api/v1/events/${eventId}/projects?limit=50&query[supervisor.email]=doubidou&format=csv&ascending=false&token=${
            refAuth.token
          }`)
          .expect(200)
          .then((res) => {
            expect(res.text).not.to.be.empty;
            const lines = res.text.split('\n');
            expect(lines.length).to.equal(1); // headers
            const columns = lines[0].split(',');
            expect(columns).to.eql(projectCSVColumns);
          });
      });
      describe('with view === user', () => {
        it('should return the projects with the a user per row', async () => {
          await request(app)
            .get(`/api/v1/events/${eventId}/projects?view=user&format=csv&limit=50&token=${refAuth.token}`)
            .expect(200)
            .then((res) => {
              expect(res.text).not.to.be.empty;
              const lines = res.text.split('\n');
              // Limit is "wrong" because it's only applied to the number of project
              expect(lines.length).to.equal(110);
              const columns = lines[0].split(',');
              expect(columns).to.eql(userCSVColumns);
            });
        });
      });
    });
  });
});
