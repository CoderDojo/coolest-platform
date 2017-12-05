import vueUnitHelper from 'vue-unit-helper';
import EditProject from '!!vue-loader?inject!@/project/Edit';

describe('EditProject component', () => {
  let sandbox;
  let EventServiceMock;
  let ProjectServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    EventServiceMock = {
      get: sandbox.stub(),
    };
    ProjectServiceMock = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(EditProject({
      '@/event/service': EventServiceMock,
      '@/project/service': ProjectServiceMock,
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

    describe('fetchProject', () => {
      it('should fetch the project using ProjectService', async () => {
        // ARRANGE
        vm.eventId = 'foo';
        vm.projectId = 'bar';
        ProjectServiceMock.get.withArgs('foo', 'bar').resolves({ body: 'baz' });

        // ACT
        await vm.fetchProject();

        // ASSERT
        expect(vm.project).to.equal('baz');
      });
    });
  });

  describe('created', () => {
    it('should fetch the event and project', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchEvent');
      sandbox.stub(vm, 'fetchProject');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.have.been.calledOnce;
      expect(vm.fetchProject).to.have.been.calledOnce;
    });
  });
});
