import vueUnitHelper from 'vue-unit-helper';
import ProjectForm from '!!vue-loader?inject!@/project/ExtraDetails';

describe('Project ExtraDetails component', () => {
  let vm;
  let sandbox;
  let ProjectServiceMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ProjectServiceMock = {
      partialUpdate: sandbox.stub(),
    };
    vm = vueUnitHelper(ProjectForm({
      '@/project/service': ProjectServiceMock,
    }));
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('watchers', () => {
    describe('project', () => {
      it('should set answers from the project', () => {
        // ARRANGE
        vm.project = {
          answers: 'foo',
        };
        vm.answers = 'bar';

        // ACT
        vm.$watchers.project();

        // ASSERT
        expect(vm.answers).to.equal('foo');
      });
    });
  });

  describe('methods', () => {
    describe('hasQuestion', () => {
      it('should return true if the provided question is in the questions array', () => {
        // ARRANGE
        vm.event = {
          questions: ['foo', 'bar'],
        };

        // ASSERT
        expect(vm.hasQuestion('bar')).to.equal(true);
      });

      it('should return false if the provided question is not in the questions array', () => {
        // ARRANGE
        vm.event = {
          questions: ['foo', 'bar'],
        };

        // ASSERT
        expect(vm.hasQuestion('baz')).to.equal(false);
      });
    });

    describe('onSubmit', async () => {
      // ARRANGE
      const answers = { baz: true };
      vm.answers = answers;
      vm.eventSlug = 'slug';
      vm.event = { id: 'foo' };
      vm.projectId = 'bar';
      vm.project = { id: 'bar' };
      ProjectServiceMock.partialUpdate.withArgs('foo', 'bar', { answers }).resolves();
      vm.$ga = {
        event: sandbox.stub(),
      };
      vm.$router = {
        push: sandbox.stub(),
      };

      // ACT
      await vm.onSubmit();

      // ASSERT
      expect(this.$ga.event).to.have.been.calledOnce;
      expect(this.$ga.event).to.have.been.calledWith({
        eventCategory: 'ProjectRegistration',
        eventAction: 'ExtraDetailsProvided',
        eventLabel: 'foo',
      });
      expect(this.$router.push).to.have.been.calledOnce;
      expect(this.$router.push).to.have.been.calledWith({
        name: 'CreateProjectCompleted',
        params: {
          eventSlug: 'slug',
          projectId: 'bar',
          _event: { id: 'foo' },
          _project: { id: 'bar' },
        },
      });
    });
  });
});
