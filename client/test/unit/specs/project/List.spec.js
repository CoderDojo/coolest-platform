import vueUnitHelper from 'vue-unit-helper';
import ProjectList from '!!vue-loader?inject!@/project/List';

describe('ProjectList component', () => {
  let vm;
  const sandbox = sinon.sandbox.create();
  const ProjectServiceMock = {
    list: sandbox.stub(),
  };
  const ProjectListWithMocks = ProjectList({
    '@/project/service': ProjectServiceMock,
  });

  beforeEach(() => {
    vm = vueUnitHelper(ProjectListWithMocks);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('watchers', () => {
    describe('event', () => {
      it('should call fetchProjects when event id is defined and no projects are loaded', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProjects');
        vm.projects = [];
        vm.event = { id: 'foo' };

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProjects).to.have.been.calledOnce;
      });

      it('should not call fetchProjects when event id is not defined and no projects are loaded', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProjects');
        vm.projects = [];
        vm.event = {};

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProjects).to.not.have.been.called;
      });

      it('should not call fetchProjects when event id is defined and projects are loaded', () => {
        // ARRANGE
        sandbox.stub(vm, 'fetchProjects');
        vm.projects = ['foo', 'bar'];
        vm.event = {};

        // ACT
        vm.$watchers.event();

        // ASSERT
        expect(vm.fetchProjects).to.not.have.been.called;
      });
    });
  });

  describe('methods', () => {
    describe('fetchProjects', () => {
      it('should update this.projects with the projects fetched from ProjectService', async () => {
        // ARRANGE
        vm.eventSlug = 'foo';
        vm.userId = 'bar';
        ProjectServiceMock.list.withArgs('foo', 'bar').resolves({ body: { data: 'baz' } });

        // ACT
        await vm.fetchProjects();

        // ASSERT
        expect(vm.projects).to.equal('baz');
      });
    });
  });

  describe('created()', () => {
    it('should fetch projects if event id is defined', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchProjects');
      vm.event = { id: 'foo' };

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProjects).to.have.been.calledOnce;
    });

    it('should not fetch projects if event id is not defined', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchProjects');
      vm.event = {};

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProjects).to.not.have.been.called;
    });
  });
});
