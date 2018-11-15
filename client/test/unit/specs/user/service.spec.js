import Vue from 'vue';
import UserService from '@/user/service';

describe('User service', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('create()', () => {
    it('should make a post call to /api/v1/users with the given email', async () => {
      // ARRANGE
      const email = 'example@example.com';
      const eventSlug = 'bar';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/users', { email, eventSlug })
        .resolves('success');

      // ACT
      const response = await UserService.create(email, eventSlug);

      // ASSERT
      expect(response).to.equal('success');
    });

    it('should add authToken to localStorage and to req headers if returned', async () => {
      // ARRANGE
      const email = 'example@example.com';
      const eventSlug = 'bar';
      const res = {
        body: {
          auth: {
            token: 'foo',
          },
        },
      };
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/users', { email, eventSlug })
        .resolves(res);
      sandbox.stub(localStorage, 'setItem');

      // ACT
      await UserService.create(email, eventSlug);

      // ASSERT
      expect(localStorage.setItem).to.have.been.calledWith('authToken', 'foo');
      expect(Vue.http.headers.common.Authorization).to.equal('Bearer foo');
    });
  });
});
