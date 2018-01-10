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

  describe('methods', () => {
    describe('fetchProjects', () => {
      it('should update this.projects with the projects fetched from ProjectService', async () => {
        // ARRANGE
        vm.eventSlug = 'cp2018';
        ProjectServiceMock.list.withArgs('cp2018').returns({ body: 'bar' });

        // ACT
        await vm.fetchProjects();

        // ASSERT
        expect(vm.projects).to.equal('bar');
      });
    });
  });

  describe('created()', () => {
    it('should fetch projects', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchProjects');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProjects).to.have.been.calledOnce;
    });
  });
});
