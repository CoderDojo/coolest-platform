import vueUnitHelper from 'vue-unit-helper';
import ProjectForm from '!!vue-loader?inject!@/project/ExtraDetails';

describe('Project ExtraDetails component', () => {
  let vm;
  let sandbox;
  let ProjectServiceMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
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

      it('should set answers to an empty object if the project does not have answers yet', () => {
        // ARRANGE
        vm.project = {
          answers: null,
        };
        vm.answers = 'bar';

        // ACT
        vm.$watchers.project();

        // ASSERT
        expect(vm.answers).to.deep.equal({});
      });
    });
  });

  describe('computed', () => {
    describe('usedQuestions', () => {
      it('should return all the questions used in this instance', () => {
        vm.event = {
          questions: ['social_project'],
        };
        expect(vm.usedQuestions).to.eql([{
          key: 'social_project',
          sentence: 'Does your project have an educational focus/aim?',
        }]);
      });
      it('should ignore undefined questions', () => {
        vm.event = {
          questions: ['are_you_a_banana'],
        };
        expect(vm.usedQuestions).to.eql([]);
      });
    });
  });

  describe('methods', () => {
    describe('onSubmit', async () => {
      it('should go to the create project completed page', async () => {
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
        vm.$route = {
          path: '',
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'ExtraDetailsProvided',
          eventLabel: 'foo',
        });
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({
          name: 'CreateProjectCompleted',
          params: {
            eventSlug: 'slug',
            projectId: 'bar',
            _event: { id: 'foo' },
            _project: { id: 'bar' },
          },
        });
      });

      it('should go to the admin project list view if the route is admin', async () => {
        // ARRANGE;
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
        vm.$route = {
          path: '/admin/...',
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'ExtraDetailsProvided',
          eventLabel: 'foo',
        });
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({
          name: 'AdminProjects',
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
});
