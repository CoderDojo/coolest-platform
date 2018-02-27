import vueUnitHelper from 'vue-unit-helper';
import Auth from '!!vue-loader?inject!@/event/Auth';

describe('Auth component', () => {
  let sandbox;
  let CookieMock;
  let UserServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    CookieMock = {
      set: sandbox.stub(),
    };
    UserServiceMock = {
      create: sandbox.stub(),
    };
    vm = vueUnitHelper(Auth({
      'js-cookie': CookieMock,
      '@/user/service': UserServiceMock,
    }));
    vm.$router = {
      push: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('methods', () => {
    describe('onSubmit', () => {
      it('should create a user and navigate to create-project', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        vm.eventSlug = 'foo';
        UserServiceMock.create.withArgs(vm.email).resolves({
          body: {
            auth: {
              token: 'foo',
            },
          },
        });
        vm.$validator = {
          validateAll: sandbox.stub().returns(true),
        };
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(UserServiceMock.create).to.have.been.calledOnce;
        expect(CookieMock.set).to.have.been.calledOnce;
        expect(CookieMock.set).to.have.been.calledWith('authToken', 'foo');
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'NewUserAuth',
          eventLabel: 'foo',
        });
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({ name: 'CreateProject', params: { eventSlug: 'foo' } });
      });
      it('should set the error if the user already exists', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        vm.eventId = 'foo';
        UserServiceMock.create.withArgs(vm.email).rejects({ status: 409 });
        vm.$validator = {
          validateAll: sandbox.stub().returns(true),
        };
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(UserServiceMock.create).to.have.been.calledOnce;
        expect(CookieMock.set).to.not.have.been.called;
        expect(vm.$ga.event).to.not.have.been.called;
        expect(vm.$router.push).to.not.have.been.called;
        expect(vm.error).to.eql({ status: 409 });
      });
    });
  });
});
