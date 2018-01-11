import vueUnitHelper from 'vue-unit-helper';
import AdminLogin from '!!vue-loader?inject!@/admin/auth/Login';

describe('AdminLogin component', () => {
  let sandbox;
  let vm;
  let MockAdminAuthService;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    MockAdminAuthService = {
      login: sandbox.stub(),
    };
    vm = vueUnitHelper(AdminLogin({
      './service': MockAdminAuthService,
    }));
  });

  describe('methods', () => {
    describe('login()', () => {
      it('should alert if login fails', async () => {
        // ARRANGE
        vm.email = 'test@example.com';
        vm.password = 'test';
        MockAdminAuthService.login.withArgs('test@example.com', 'test').resolves(false);
        sandbox.stub(window, 'alert');

        // ACT
        await vm.login();

        // ASSERT
        expect(window.alert).to.have.been.calledOnce;
        expect(window.alert).to.have.been.calledWith('Invalid login');
      });

      it('should redirect to the given redirect query string on successful login', async () => {
        // ARRANGE
        vm.email = 'test@example.com';
        vm.password = 'test';
        MockAdminAuthService.login.withArgs('test@example.com', 'test').resolves(true);
        vm.$route = {
          query: { redirect: 'foo' },
        };
        vm.$router = {
          replace: sandbox.stub(),
        };

        // ACT
        await vm.login();

        // ASSERT
        expect(vm.$router.replace).to.have.been.calledOnce;
        expect(vm.$router.replace).to.have.been.calledWith('foo');
      });

      it('should redirect to Admin if no redirect query string is provided', async () => {
        // ARRANGE
        vm.email = 'test@example.com';
        vm.password = 'test';
        MockAdminAuthService.login.withArgs('test@example.com', 'test').resolves(true);
        vm.$route = {
          query: {},
        };
        vm.$router = {
          replace: sandbox.stub(),
        };

        // ACT
        await vm.login();

        // ASSERT
        expect(vm.$router.replace).to.have.been.calledOnce;
        expect(vm.$router.replace).to.have.been.calledWith({ name: 'Admin' });
      });
    });
  });
});
