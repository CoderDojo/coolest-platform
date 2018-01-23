import vueUnitHelper from 'vue-unit-helper';
import CreateProject from '!!vue-loader?inject!@/project/Create';

describe('Create Project component', () => {
  let sandbox;
  let ProjectServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ProjectServiceMock = {
      get: sandbox.stub(),
      create: sandbox.stub(),
    };
    vm = vueUnitHelper(CreateProject({
      '@/project/service': ProjectServiceMock,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods', () => {
    describe('onSubmit', () => {
      it('should remove the beforeunload event and set submitted to true', async () => {
        // ARRANGE
        const event = { id: 'foo' };
        const project = {
          name: 'bar',
          users: [{
            type: 'supervisor',
          }],
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.eventSlug = 'foo';
        vm.projectPayload = project;
        ProjectServiceMock.create.resolves({ body: createdProject });
        sandbox.stub(window, 'removeEventListener');
        vm.submitted = false;
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit(project);

        // ASSERT
        expect(window.removeEventListener).to.have.been.calledOnce;
        expect(window.removeEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
        expect(vm.submitted).to.equal(true);
        expect(ProjectServiceMock.create).to.have.been.calledOnce;
        expect(ProjectServiceMock.create).to.have.been.calledWith('foo', project);
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'NewProject',
          eventLabel: 'foo',
        });
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({
          name: 'CreateProjectCompleted',
          params: {
            eventSlug: 'foo',
            projectId: 'baz',
            _event: event,
            _project: createdProject,
          },
        });
      });

      it('should go to the extra details page if the event has questions', async () => {
        // ARRANGE
        const event = {
          id: 'foo',
          questions: ['a', 'b'],
        };
        const project = {
          name: 'bar',
          users: [{
            type: 'supervisor',
          }],
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.eventSlug = 'foo';
        vm.projectPayload = project;
        ProjectServiceMock.create.resolves({ body: createdProject });
        sandbox.stub(window, 'removeEventListener');
        vm.$ga = {
          event: sandbox.stub(),
        };
        vm.$router = {
          push: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit(project);

        // ASSERT
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({
          name: 'ProjectExtraDetails',
          params: {
            eventSlug: 'foo',
            projectId: 'baz',
            _event: event,
            _project: createdProject,
          },
        });
      });

      it('should set the error if the backend failed', async () => {
        // ARRANGE
        const event = { id: 'foo' };
        const project = {
          name: 'bar',
          users: [{
            type: 'supervisor',
          }],
        };
        vm.event = event;
        vm.eventSlug = 'foo';
        vm.projectPayload = project;
        ProjectServiceMock.create.rejects(new Error('Fake err'));
        sandbox.stub(window, 'removeEventListener');
        vm.submitted = false;
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.onSubmit(project);

        // ASSERT
        expect(vm.submitted).to.equal(false);
        expect(window.removeEventListener).to.not.have.been.called;
        expect(ProjectServiceMock.create).to.have.been.calledOnce;
        expect(ProjectServiceMock.create).to.have.been.calledWith('foo', project);
        expect(vm.$ga.event).to.not.have.been.called;
        expect(vm.$router.push).to.not.have.been.called;
        expect(vm.error.message).to.equal('Fake err');
      });
    });

    describe('onBeforeUnload', () => {
      it('should return a string for the onbeforeunload confirmation dialog', () => {
        // ARRANGE
        const e = {};
        const expectedString = 'Are you sure you don\'t want to complete your registration application?';

        // ACT
        const res = vm.onBeforeUnload(e);

        // ASSERT
        expect(e.returnValue).to.equal(expectedString);
        expect(res).to.equal(expectedString);
      });
    });
  });

  describe('destroyed', () => {
    it('should remove beforeunload event listener', () => {
      // ARRANGE
      sandbox.stub(window, 'removeEventListener');

      // ACT
      vm.$lifecycleMethods.destroyed();

      // ASSERT
      expect(window.removeEventListener).to.have.been.calledOnce;
      expect(window.removeEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
    });
  });
});
