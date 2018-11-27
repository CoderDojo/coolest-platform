import ProjectView from '!!vue-loader?inject!@/admin/projects/View';
import vueUnitHelper from 'vue-unit-helper';

describe.only('ProjectView', () => {
  let vm;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    const ProjectViewWithMocks = ProjectView({
      '@/project/service': { status: { update: sandbox.stub().resolves() } },
    });
    vm = vueUnitHelper(ProjectViewWithMocks);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('methods', () => {
    describe('updateProjectStatus', () => {
      it('gets reloaded', async () => {
        vm.project = { status: 'pending' };
        vm.event = { id: 'foo' };
        vm.$route = { params: { projectId: 'bar' } };
        vm.$router = { go: sandbox.stub() };
        await vm.updateProjectStatus('active');

        expect(vm.$router.go).to.have.been.calledOnce;
      });
    });
  });
});
