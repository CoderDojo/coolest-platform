import ProjectView from '!!vue-loader?inject!@/admin/projects/View';
import vueUnitHelper from 'vue-unit-helper';

describe('ProjectView', () => {
  let vm;
  const sandbox = sinon.createSandbox();

  const ProjectViewWithMocks = ProjectView({
    '@/project/service': { status: { update: sandbox.stub().resolves() } },
  });

  beforeEach(() => {
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
        vm.event = { id: '' };
        vm.$router = { go: sandbox.stub(), params: {} };
        await vm.updateProjectStatus('active');

        expect(vm.$router.go).to.have.been.calledOnce;
      });
    });
  });
});
