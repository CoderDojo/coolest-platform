// TODO fix parallel tests
// const request = require('supertest');
// const proxy = require('proxyquire');
// const dbConfig = require('../../config/db.json');
// dbConfig['@global'] = true;
// dbConfig['@noCallThru'] = true;
// describe('integration: users', () => {
//   let app;
//   before( function (done) {
//     app = proxy(
//       '../../../bin/www', {
//         '../config/db.json': dbConfig,
//       }
//     );
//     this.timeout(4000)
//     setTimeout(done, 2000);
//   });
//
//   describe('post', () => {
//     it('should create a user', async () => {
//       const payload = { email: 'me@example.com' };
//       await request(app)
//       .post('/api/v1/users')
//       .set('Accept', 'application/json')
//       .send(payload)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then((res) => {
//         expect(res.body.user).to.have.all.keys(['email', 'created_at', 'updated_at', 'id']);
// eslint-disable-next-line max-len
//         expect(res.body.auth).to.have.all.keys(['userId', 'created_at', 'updated_at', 'id', 'token']);
//         expect(res.body.user.email).to.equal(payload.email);
//         expect(res.body.user.id).to.equal(res.body.auth.userId);
//       });
//     });
//   });
//   after((done) => {
//     app.close(done);
//   })
// });
