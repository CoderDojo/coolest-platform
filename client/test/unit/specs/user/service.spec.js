import Vue from 'vue';
import UserService from '@/user/service';

describe('User service', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('create()', () => {
    it('should make a post call to /api/v1/users with the given email', async () => {
      // ARRANGE
      const email = 'example@example.com';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/users', { email })
        .returns(Promise.resolve('success'));

      // ACT
      const response = await UserService.create(email);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
