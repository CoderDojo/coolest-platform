import Vue from 'vue';
import AuthService from '@/auth/service';

describe('Auth service', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('authToken()', () => {
    it('should make a post call to /api/v1/auth/token with the given token', async () => {
      // ARRANGE
      const token = 'some-token';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/auth/token', { token })
        .resolves('success');

      // ACT
      const response = await AuthService.authToken(token);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
