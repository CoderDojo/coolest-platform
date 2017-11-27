import vueUnitHelper from 'vue-unit-helper';
import Auth from '!!vue-loader?inject!@/auth/Auth';

describe('Auth component', () => {
  const sandbox = sinon.sandbox.create();
  const AuthServiceMock = {
    auth: sandbox.stub(),
  };
  const UserServiceMock = {
    create: sandbox.stub(),
  };
  const vm = vueUnitHelper(Auth({
    '@/auth/service': AuthServiceMock,
    '@/user/service': UserServiceMock,
  }));
  vm.$router = {
    push: sandbox.stub(),
  };

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('methods', () => {
    describe('onSubmit', () => {
      it('should navigate to auth-email when auth succeeds', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        AuthServiceMock.auth.withArgs(vm.email).returns(Promise.resolve());

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(AuthServiceMock.auth).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith('auth-email');
        expect(UserServiceMock.create).to.not.have.been.called;
      });

      it('should create a user and navigate to create-project when auth fails', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        AuthServiceMock.auth.withArgs(vm.email).returns(Promise.reject());
        UserServiceMock.create.withArgs(vm.email).returns(Promise.resolve());

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(AuthServiceMock.auth).to.have.been.calledOnce;
        expect(UserServiceMock.create).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith('create-project');
      });
    });
  });
});
