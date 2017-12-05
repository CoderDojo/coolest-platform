import vueUnitHelper from 'vue-unit-helper';
import CreateProject from '!!vue-loader?inject!@/project/Create';

describe('EditProject component', () => {
  let sandbox;
  let EventServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    EventServiceMock = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(CreateProject({
      '@/event/service': EventServiceMock,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods', () => {
    describe('fetchEvent', () => {
      it('should fetch the event using EventService', async () => {
        // ARRANGE
        vm.eventId = 'foo';
        EventServiceMock.get.withArgs('foo').resolves({ body: 'bar' });

        // ACT
        await vm.fetchEvent();

        // ASSERT
        expect(vm.event).to.equal('bar');
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
