import vueUnitHelper from 'vue-unit-helper';
import CreateProject from '!!vue-loader?inject!@/project/Create';

describe('Create Project component', () => {
  let sandbox;
  let EventServiceMock;
  let ProjectServiceMock;
  let vm;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    EventServiceMock = {
      get: sandbox.stub(),
    };
    ProjectServiceMock = {
      get: sandbox.stub(),
      create: sandbox.stub(),
    };
    vm = vueUnitHelper(CreateProject({
      '@/event/service': EventServiceMock,
      '@/project/service': ProjectServiceMock,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('methods', () => {
    describe('fetchEvent', () => {
      it('should fetch the event using EventService', async () => {
        // ARRANGE
        vm.eventId = 'foo';
        EventServiceMock.get.withArgs('foo').resolves({ body: 'bar' });

        // ACT
        await vm.fetchEvent();

        // ASSERT
        expect(vm.event).to.equal('bar');
      });
    });

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
        vm.eventId = 'foo';
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
            eventId: 'foo',
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
        vm.eventId = 'foo';
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
            eventId: 'foo',
            projectId: 'baz',
            _event: event,
            _project: createdProject,
          },
        });
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

  describe('created', () => {
    it('should fetch the event', () => {
      // ARRANGE
      sandbox.stub(vm, 'fetchEvent');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.fetchEvent).to.have.been.calledOnce;
    });
  });
});
