import vueUnitHelper from 'vue-unit-helper';
import CreateProjectCompleted from '!!vue-loader?inject!@/project/CreateCompleted';

describe('Create Project Completed component', () => {
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
    vm = vueUnitHelper(CreateProjectCompleted({
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
        vm.eventSlug = 'foo';
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
        vm.event = { id: 'foo' };
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
    it('should fetch the event and project if not passed as props', async () => {
      // ARRANGE
      vm._event = undefined;
      vm._project = undefined;
      sandbox.stub(vm, 'fetchEvent');
      sandbox.stub(vm, 'fetchProject');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.have.been.calledOnce;
      expect(vm.fetchProject).to.have.been.calledOnce;
    });

    it('should not fetch the event and project if passed as props', async () => {
      // ARRANGE
      const event = { id: 'foo' };
      const project = { id: 'bar' };
      vm._event = event;
      vm._project = project;
      sandbox.stub(vm, 'fetchEvent');
      sandbox.stub(vm, 'fetchProject');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.not.have.been.called;
      expect(vm.fetchProject).to.not.have.been.called;
      expect(vm.event).to.deep.equal(event);
      expect(vm.project).to.deep.equal(project);
    });
  });
});
