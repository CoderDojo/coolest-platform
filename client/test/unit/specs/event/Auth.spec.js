import vueUnitHelper from 'vue-unit-helper';
import Auth from '!!vue-loader?inject!@/event/Auth';

describe('Auth component', () => {
  let sandbox;
  let CookieMock;
  let AuthServiceMock;
  let UserServiceMock;
  let EventServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    CookieMock = {
      set: sandbox.stub(),
    };
    AuthServiceMock = {
      auth: sandbox.stub(),
    };
    UserServiceMock = {
      create: sandbox.stub(),
    };
    EventServiceMock = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(Auth({
      'js-cookie': CookieMock,
      '@/auth/service': AuthServiceMock,
      '@/user/service': UserServiceMock,
      '@/event/service': EventServiceMock,
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
    describe('fetchEvent', () => {
      it('should load the event for the given eventId', async () => {
        // ARRANGE
        vm.eventId = 'foo';
        EventServiceMock.get.withArgs('foo').resolves({ body: 'bar' });

        // ACT
        await vm.fetchEvent();

        // ASSERT
        expect(vm.event).to.equal('bar');
      });
    });

    describe('onSubmit', () => {
      it('should navigate to auth-email when auth succeeds', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        AuthServiceMock.auth.withArgs(vm.email).resolves();

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(AuthServiceMock.auth).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({ name: 'AuthEmail' });
        expect(UserServiceMock.create).to.not.have.been.called;
      });

      it('should create a user and navigate to create-project when auth fails', async () => {
        // ARRANGE
        vm.email = 'example@example.com';
        vm.eventId = 'foo';
        AuthServiceMock.auth.withArgs(vm.email).rejects();
        UserServiceMock.create.withArgs(vm.email).resolves({
          body: {
            auth: {
              token: 'foo',
            },
          },
        });
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(AuthServiceMock.auth).to.have.been.calledOnce;
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
        expect(vm.$router.push).to.have.been.calledWith({ name: 'CreateProject', params: { eventId: 'foo' } });
      });
    });
  });

  describe('created', () => {
    it('should fetch the event', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchEvent');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.have.been.calledOnce;
    });
  });
});
