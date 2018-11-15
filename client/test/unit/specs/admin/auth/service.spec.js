import Vue from 'vue';
import AdminAuthService from '@/admin/auth/service';

describe('Admin Auth service', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('checkToken', () => {
    it('should set the Authorization header and return true if the request succeeds', async () => {
      // ARRANGE
      const token = 'admin_token';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/admin/auth/token', { token })
        .resolves();

      // ACT
      const res = await AdminAuthService.checkToken(token);

      // ASSERT
      expect(res).to.equal(true);
      expect(Vue.http.headers.common.Authorization).to.equal('Bearer admin_token');
    });

    it('should not set the Authorization header and return false if the request fails', async () => {
      // ARRANGE
      const token = 'admin_token';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/admin/auth/token', { token })
        .rejects();
      Vue.http.headers.common.Authorization = '';

      // ACT
      const res = await AdminAuthService.checkToken(token);

      // ASSERT
      expect(res).to.equal(false);
      expect(Vue.http.headers.common.Authorization).to.equal('');
    });
  });

  describe('login()', () => {
    it('should return true for a valid login and set the authToken in localStorage and req headers', async () => {
      // ARRANGE
      const email = 'admin@example.com';
      const password = 'admin';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/admin/auth', { email, password })
        .resolves({
          body: {
            token: 'admin_token',
          },
        });
      sandbox.stub(localStorage, 'setItem');

      // ACT
      const response = await AdminAuthService.login(email, password);

      // ASSERT
      expect(response).to.equal(true);
      expect(localStorage.setItem).to.have.been.calledOnce;
      expect(localStorage.setItem).to.have.been.calledWith('authToken', 'admin_token');
      expect(Vue.http.headers.common.Authorization).to.equal('Bearer admin_token');
    });

    it('should return false for an invalid login and not set the authToken in localStorage and req headers', async () => {
      // ARRANGE
      const email = 'admin@example.com';
      const password = 'admin';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/admin/auth', { email, password })
        .rejects();
      sandbox.stub(localStorage, 'setItem');
      Vue.http.headers.common.Authorization = 'Bearer nothing_to_see_here';

      // ACT
      const response = await AdminAuthService.login(email, password);

      // ASSERT
      expect(response).to.equal(false);
      expect(localStorage.setItem).to.not.have.been.called;
      expect(Vue.http.headers.common.Authorization).to.equal('Bearer nothing_to_see_here');
    });
  });
});
