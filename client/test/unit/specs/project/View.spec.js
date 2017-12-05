import vueUnitHelper from 'vue-unit-helper';
import ViewProject from '!!vue-loader?inject!@/project/View';

describe('ViewProject component', () => {
  let vm;
  const sandbox = sinon.sandbox.create();
  const ProjectServiceMock = {
    get: sandbox.stub(),
  };
  const ViewProjectWithMocks = ViewProject({
    '@/project/service': ProjectServiceMock,
  });

  beforeEach(() => {
    vm = vueUnitHelper(ViewProjectWithMocks);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('methods', () => {
    describe('fetchProject', () => {
      it('should update this.project with the project fetched from ProjectService', async () => {
        // ARRANGE
        vm.id = 'foo';
        ProjectServiceMock.get.withArgs('foo').returns({ body: 'bar' });

        // ACT
        await vm.fetchProject();

        // ASSERT
        expect(vm.project).to.equal('bar');
      });
    });
  });

  describe('created()', () => {
    it('should fetch project if an id exists', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchProject');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchProject).to.have.been.calledOnce;
    });
  });
});
