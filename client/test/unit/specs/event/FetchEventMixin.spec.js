import vueUnitHelper from 'vue-unit-helper';
import moment from 'moment';
import FetchEventMixin from 'inject-loader!@/event/FetchEventMixin';

describe('Fetch Event mixin', () => {
  let sandbox;
  let EventServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    EventServiceMock = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(FetchEventMixin({
      '@/event/service': EventServiceMock,
    }).default);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods', () => {
    describe('fetchEvent', () => {
      it('should fetch the event using EventService', async () => {
        // ARRANGE
        vm.eventSlug = 'foo';
        EventServiceMock.get.withArgs('foo').resolves({ body: 'bar' });

        // ACT
        await vm.fetchEvent();

        // ASSERT
        expect(vm.event).to.equal('bar');
      });
    });
  });

  describe('created', () => {
    it('should fetch the event and project if not passed as props', async () => {
      // ARRANGE
      vm._event = undefined;
      sandbox.stub(vm, 'fetchEvent');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.have.been.calledOnce;
    });

    it('should not fetch the event and project if passed as props', async () => {
      // ARRANGE
      const event = { id: 'foo' };
      vm._event = event;
      sandbox.stub(vm, 'fetchEvent');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.not.have.been.called;
      expect(vm.event).to.deep.equal(event);
    });
  });
  describe('computed', () => {
    it('should return that the registration is closed', () => {
      vm.event = {
        registrationEnd: moment.utc().subtract(1, 'day'),
      };
      expect(vm.isOpen).to.be.false;
    });
    it('should return that the registration is opened', () => {
      vm.event = {
        registrationEnd: moment.utc().add(1, 'day'),
      };
      expect(vm.isOpen).to.be.true;
    });
    it('should return that the registration is restricted', () => {
      vm.event = {
        freezeDate: moment.utc().add(1, 'day'),
      };
      expect(vm.isFrozen).to.be.false;
    });
    it('should return that the registration is frozen', () => {
      vm.event = {
        freezeDate: moment.utc().subtract(1, 'day'),
      };
      expect(vm.isFrozen).to.be.true;
    });
  });
});
