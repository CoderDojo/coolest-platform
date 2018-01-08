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

    describe('onSubmit', () => {
      it('should remove the beforeunload event and set submitted to true', () => {
        // ARRANGE
        sandbox.stub(window, 'removeEventListener');
        vm.submitted = false;

        // ACT
        vm.onSubmit();

        // ASSERT
        expect(window.removeEventListener).to.have.been.calledOnce;
        expect(window.removeEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
        expect(vm.submitted).to.equal(true);
      });
    });

    describe('onBeforeUnload', () => {
      it('should return a string for the onbeforeunload confirmation dialog', () => {
        // ARRANGE
        const e = {};
        const expectedString = 'Are you sure you don\'t want to complete your registration application?';

        // ACT
        const res = vm.onBeforeUnload(e);

        // ASSERT
        expect(e.returnValue).to.equal(expectedString);
        expect(res).to.equal(expectedString);
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
