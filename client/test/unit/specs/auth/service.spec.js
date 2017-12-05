import Vue from 'vue';
import AuthService from '@/auth/service';

describe('Auth service', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('auth()', () => {
    it('should make a post call to /api/v1/auth with the given email', async () => {
      // ARRANGE
      const email = 'example@example.com';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/auth', { email })
        .resolves('success');

      // ACT
      const response = await AuthService.auth(email);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
