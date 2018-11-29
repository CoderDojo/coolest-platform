import vueUnitHelper from 'vue-unit-helper';
import AdminUsersCreate from '!!vue-loader?inject!@/admin/users/Create';

describe('Admin Projects List component', () => {
  let sandbox;
  let vm;
  let MockUserService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    MockUserService = {
      createAdmin: sandbox.stub(),
    };
    vm = vueUnitHelper(AdminUsersCreate({
      '@/user/service': MockUserService,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods', () => {
    describe('createUser', () => {
      it('should create a admin user', async () => {
        // ARRANGE
        vm.email = 'bla@coderdojo.org';
        vm.password = 'test';
        vm.$router = {
          go: sandbox.stub(),
        };
        // ACT
        await vm.createUser();

        // ASSERT
        expect(MockUserService.createAdmin).to.have.been.calledOnce;
        expect(MockUserService.createAdmin).to.have.been.calledWith({
          email: vm.email,
          password: vm.password,
        });
        expect(vm.$router.go).to.have.been.calledOnce;
      });
    });
  });
});
