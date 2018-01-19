import vueUnitHelper from 'vue-unit-helper';
import AdminProjects from '!!vue-loader?inject!@/admin/Projects';

describe('Admin Projects component', () => {
  let sandbox;
  let MockEventService;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    MockEventService = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(AdminProjects({
      '@/event/service': MockEventService,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {
    describe('tableUrl', () => {
      it('should return a url with event id when event data is available', () => {
        // ARRANGE
        vm.event = {
          id: 'foo',
        };

        // ASSERT
        expect(vm.tableUrl).to.equal('/api/v1/events/foo/projects');
      });

      it('should return an empty string when event event data is not loaded', () => {
        // ARRANGE
        vm.event = {};

        // ASSERT
        expect(vm.tableUrl).to.equal('');
      });
    });
  });

  describe('methods', () => {
    describe('fetchEvent', () => {
      it('should fetch the event using EventService', async () => {
        // ARRANGE
        vm.eventSlug = 'foo';
        MockEventService.get.withArgs('foo').resolves({ body: 'bar' });

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
