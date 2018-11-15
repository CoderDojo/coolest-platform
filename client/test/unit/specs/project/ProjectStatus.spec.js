import vueUnitHelper from 'vue-unit-helper';
import ProjectStatus from '!!vue-loader?inject!@/project/ProjectStatus';

describe('Project Status component', () => {
  let sandbox;
  let ProjectService;
  let vm;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    ProjectService = {
      status: {
        update: sandbox.stub(),
      },
    };
    vm = vueUnitHelper(ProjectStatus({
      '@/project/service': ProjectService,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {
    describe('status', () => {
      it('should return the route status', () => {
        // ARRANGE
        vm.$route = {
          params: {
            status: 'verified',
          },
        };

        // ASSERT
        expect(vm.status).to.equal('verified');
      });
    });
  });
  describe('methods', () => {
    it('should call project.status.update', async () => {
      vm.event = {
        id: 1,
      };
      vm.$route = {
        params: {
          projectId: 2,
          status: 'verified',
        },
      };

      await vm.setProjectStatus();
      expect(ProjectService.status.update).to.have.been.calledOnce;
      expect(ProjectService.status.update).to.have.been.calledWith(1, 2, { status: 'verified' });
    });
  });
});
