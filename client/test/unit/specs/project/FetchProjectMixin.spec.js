import vueUnitHelper from 'vue-unit-helper';
import FetchProjectMixin from 'inject-loader!@/project/FetchProjectMixin';

describe('Fetch Project mixin', () => {
  let sandbox;
  let ProjectServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ProjectServiceMock = {
      get: sandbox.stub(),
    };
    vm = vueUnitHelper(FetchProjectMixin({
      '@/project/service': ProjectServiceMock,
    }).default);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('watchers', () => {
    describe('event', () => {
      it('should fetchProject if there is no project defined and there is an event defined', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProject');
        vm.event = { id: 'foo' };
        vm.project = {};

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProject).to.have.been.calledOnce;
      });

      it('should not fetchProject if there is a project defined', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProject');
        vm.event = { id: 'foo' };
        vm.project = { id: 'bar' };

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProject).to.not.have.been.called;
      });

      it('should not fetchProject if there is no project or event defined', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProject');
        vm.event = {};
        vm.project = {};

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProject).to.not.have.been.called;
      });
    });
  });

  describe('methods', () => {
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
    it('should fetch the event and project if not passed as props and event.id is defined', async () => {
      // ARRANGE
      vm.event = { id: 'foo' };
      vm._project = undefined;
      sandbox.stub(vm, 'fetchProject');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProject).to.have.been.calledOnce;
    });

    it('should not fetch the event and project if not passed as props but event.id is not defined', async () => {
      // ARRANGE
      vm.event = {};
      vm._project = undefined;
      sandbox.stub(vm, 'fetchProject');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProject).to.not.have.been.called;
    });

    it('should not fetch the event and project if passed as props', async () => {
      // ARRANGE
      const project = { id: 'bar' };
      vm._project = project;
      sandbox.stub(vm, 'fetchProject');

      // ACT
      await vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProject).to.not.have.been.called;
      expect(vm.project).to.deep.equal(project);
    });
  });
});
