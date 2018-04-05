import Vue from 'vue';
import vueUnitHelper from 'vue-unit-helper';
import moment from 'moment';
import ProjectForm from '!!vue-loader?inject!@/project/Form';

describe('ProjectForm component', () => {
  let vm;
  let sandbox;
  let ProjectServiceMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ProjectServiceMock = {
      create: sandbox.stub(),
      update: sandbox.stub(),
    };
    vm = vueUnitHelper(ProjectForm({
      '@/project/service': ProjectServiceMock,
    }));
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('computed', () => {
    describe('projectPayload', () => {
      it('should return a single object from projectDetails, participants and supervisor', () => {
        // ARRANGE
        vm.projectDetails = {
          id: 'foo',
          name: 'MyProject',
          description: 'Some desc',
          category: 'scratch',
          org: 'codeclub',
          orgRef: 'That one!',
        };
        vm.participants = [{
          id: 'user1',
          firstName: 'Namey',
          lastName: 'McNameface',
          dob: '2006-11-03T00:00:00.000Z',
          specialRequirements: 'Allergic to nuts',
          gender: 'female',
        },
        {
          id: 'user2',
          firstName: 'Other',
          lastName: 'McNameface',
          dob: '2003-01-27T00:00:00.000Z',
          specialRequirements: '',
          gender: 'male',
        }];
        vm.supervisor = {
          id: 'user3',
          firstName: 'Adulty',
          lastName: 'McAdultface',
          email: 'adult@example.com',
          phone: '(08) 512-34567',
        };

        // ASSERT
        expect(vm.projectPayload).to.deep.equal({
          id: 'foo',
          name: 'MyProject',
          description: 'Some desc',
          category: 'scratch',
          org: 'codeclub',
          orgRef: 'That one!',
          users: [
            {
              id: 'user1',
              firstName: 'Namey',
              lastName: 'McNameface',
              dob: '2006-11-03T00:00:00.000Z',
              specialRequirements: 'Allergic to nuts',
              gender: 'female',
              type: 'member',
            },
            {
              id: 'user2',
              firstName: 'Other',
              lastName: 'McNameface',
              dob: '2003-01-27T00:00:00.000Z',
              specialRequirements: '',
              gender: 'male',
              type: 'member',
            },
            {
              id: 'user3',
              firstName: 'Adulty',
              lastName: 'McAdultface',
              email: 'adult@example.com',
              phone: '0851234567',
              type: 'supervisor',
            },
          ],
        });
      });

      it('should update projectDetails, participants and supervisor from set object', () => {
        // ARRANGE
        const project = {
          id: 'foo',
          name: 'MyProject',
          description: 'Some desc',
          category: 'scratch',
          org: 'coderdojo',
          orgRef: 'foo',
          members: [
            {
              id: 'user1',
              firstName: 'Namey',
              lastName: 'McNameface',
              dob: '2006-11-03T00:00:00.000Z',
              specialRequirements: 'Allergic to nuts',
              gender: 'female',
              type: 'member',
            },
            {
              id: 'user2',
              firstName: 'Other',
              lastName: 'McNameface',
              dob: '2003-01-27T00:00:00.000Z',
              specialRequirements: '',
              gender: 'male',
              type: 'member',
            },
          ],
          supervisor: {
            id: 'user3',
            firstName: 'Adulty',
            lastName: 'McAdultface',
            email: 'adult@example.com',
            phone: '0851234567',
            type: 'supervisor',
          },
        };

        // ACT
        vm.projectPayload = project;

        // ASSERT
        expect(vm.projectDetails).to.deep.equal({
          id: 'foo',
          name: 'MyProject',
          description: 'Some desc',
          category: 'scratch',
          org: 'coderdojo',
          orgRef: 'foo',
        });
        expect(vm.participants).to.deep.equal([
          {
            id: 'user1',
            firstName: 'Namey',
            lastName: 'McNameface',
            dob: new Date('2006-11-03T00:00:00.000Z'),
            specialRequirementsProvided: true,
            specialRequirements: 'Allergic to nuts',
            gender: 'female',
          },
          {
            id: 'user2',
            firstName: 'Other',
            lastName: 'McNameface',
            dob: new Date('2003-01-27T00:00:00.000Z'),
            specialRequirementsProvided: false,
            specialRequirements: '',
            gender: 'male',
          },
        ]);
        expect(vm.supervisor).to.deep.equal({
          id: 'user3',
          firstName: 'Adulty',
          lastName: 'McAdultface',
          email: 'adult@example.com',
          phone: '0851234567',
        });
        expect(vm.org).to.equal('coderdojo');
      });
    });
    describe('submitButtonText', () => {
      it("should return 'Update project' if the project is saved", () => {
        // ARRANGE
        vm.projectDetails = { id: '1234' };

        // ACT
        const text = vm.submitButtonText;

        // ASSERT
        expect(text).to.equal('Update project');
      });
      it("should return 'Register project' if the project isn't saved and it doesn't require approval", () => {
        // ARRANGE
        vm.event = { requiresApproval: false };
        vm.projectDetails = { id: null };

        // ACT
        const text = vm.submitButtonText;

        // ASSERT
        expect(text).to.equal('Register project');
      });
      it("should return 'Submit project' if the project isn't saved and it requires approval", () => {
        // ARRANGE
        vm.event = { requiresApproval: true };
        vm.projectDetails = { id: null };

        // ACT
        const text = vm.submitButtonText;

        // ASSERT
        expect(text).to.equal('Submit project');
      });
    });
  });

  describe('watchers', () => {
    describe('numParticipants', () => {
      it('should add to the participants array when number increases', () => {
        // ARRANGE
        vm.participants = [
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
        ];

        // ACT
        vm.$watchers.numParticipants(3);

        // ASSERT
        expect(vm.participants).to.deep.equal([
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
        ]);
      });

      it('should remove from the participants array when number decreases', () => {
        // ARRANGE
        vm.participants = [
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
        ];

        // ACT
        vm.$watchers.numParticipants(1);

        // ASSERT
        expect(vm.participants).to.deep.equal([{ specialRequirementsProvided: false }]);
      });

      it('should do nothing when number stays the same', () => {
        // ARRANGE
        vm.participants = [
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
        ];

        // ACT
        vm.$watchers.numParticipants(2);

        // ASSERT
        expect(vm.participants).to.deep.equal([
          { specialRequirementsProvided: false },
          { specialRequirementsProvided: false },
        ]);
      });
    });

    describe('org', () => {
      it('should update projectDetails.org and clear orgRef', () => {
        // ARRANGE
        vm.projectDetails = {
          org: 'coderdojo',
          orgRef: 'foo',
        };

        // ACT
        vm.$watchers.org('codeclub');

        // ASSERT
        expect(vm.projectDetails.org).to.equal('codeclub');
        expect(vm.projectDetails.orgRef).to.equal(undefined);
      });

      it('should do nothing if projectDetails.org is already the same as newOrg', () => {
        // ARRANGE
        vm.projectDetails = {
          org: 'coderdojo',
          orgRef: 'foo',
        };

        // ACT
        vm.$watchers.org('coderdojo');

        // ASSERT
        expect(vm.projectDetails.org).to.equal('coderdojo');
        expect(vm.projectDetails.orgRef).to.equal('foo');
      });
    });
  });

  describe('methods', () => {
    describe('fetchDojos', () => {
      it('should update this.dojos with the a list of dojos from zen', async () => {
        // ARRANGE
        sandbox.stub(Vue.http, 'post').withArgs('https://zen.coderdojo.com/api/2.0/dojos', {
          query: {
            verified: 1,
            deleted: 0,
            stage: { ne$: 4 },
            fields$: ['id', 'name'],
            sort$: {
              name: 1,
            },
          },
        }).resolves({ body: 'bar' });

        // ACT
        await vm.fetchDojos();

        // ASSERT
        expect(vm.dojos).to.equal('bar');
      });
    });
    describe('onSubmit', () => {
      it('should create the project with ProjectService then go to a confirmation page if form is valid and no project id is defined', async () => {
        // ARRANGE
        const event = { slug: 'foo' };
        const project = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = project;
        vm.$validator = {
          validateAll: sandbox.stub().resolves(true),
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.projectPayload = project;
        sandbox.stub(vm, 'register').resolves(createdProject);
        sandbox.stub(vm, 'update');
        sandbox.stub(window, 'removeEventListener');
        vm.submitted = false;
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$route = {
          path: '',
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.register).to.have.been.calledOnce;
        expect(vm.update).to.not.have.been.called;
        expect(window.removeEventListener).to.have.been.calledOnce;
        expect(window.removeEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
        expect(vm.submitted).to.equal(true);
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

      it('should update the project with ProjectService then go to a confirmation page if form is valid and project id is defiend', async () => {
        // ARRANGE
        const event = { slug: 'foo' };
        const project = {
          id: 'baz',
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = project;
        vm.$validator = {
          validateAll: sandbox.stub().resolves(true),
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.projectPayload = project;
        sandbox.stub(vm, 'register');
        sandbox.stub(vm, 'update').resolves(createdProject);
        sandbox.stub(window, 'removeEventListener');
        vm.submitted = false;
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$route = {
          path: '',
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.update).to.have.been.calledOnce;
        expect(vm.register).to.not.have.been.called;
        expect(window.removeEventListener).to.have.been.calledOnce;
        expect(window.removeEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
        expect(vm.submitted).to.equal(true);
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

      it('should do nothing if form is not valid', async () => {
        // ARRANGE
        vm.$validator = {
          validateAll: sandbox.stub().resolves(false),
        };
        sandbox.stub(vm, 'register');
        sandbox.stub(vm, 'update');

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.update).to.not.have.been.called;
        expect(vm.register).to.not.have.been.called;
      });

      it('should go to the extra details page if the event has questions', async () => {
        // ARRANGE
        const event = {
          slug: 'foo',
          questions: ['a', 'b'],
        };
        const project = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.projectPayload = project;
        sandbox.stub(vm, 'register').resolves(createdProject);
        sandbox.stub(window, 'removeEventListener');
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$validator = {
          validateAll: sandbox.stub().resolves(true),
        };
        vm.$route = {
          path: '',
        };

        // ACT
        await vm.onSubmit();

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

      it('should go to the admin extra details page if the route is admin', async () => {
        // ARRANGE
        const event = {
          slug: 'foo',
          questions: ['a', 'b'],
        };
        const project = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [
            {
              type: 'member',
            },
          ],
        };
        const createdProject = { id: 'baz' };
        vm.event = event;
        vm.projectPayload = project;
        sandbox.stub(vm, 'register').resolves(createdProject);
        sandbox.stub(window, 'removeEventListener');
        vm.$router = {
          push: sandbox.stub(),
        };
        vm.$validator = {
          validateAll: sandbox.stub().resolves(true),
        };
        vm.$route = {
          path: '/admin/',
        };

        // ACT
        await vm.onSubmit();

        // ASSERT
        expect(vm.$router.push).to.have.been.calledOnce;
        expect(vm.$router.push).to.have.been.calledWith({
          name: 'AdminProjectExtraDetails',
          params: {
            eventSlug: 'foo',
            projectId: 'baz',
            _event: event,
            _project: createdProject,
          },
        });
      });
    });

    describe('register', () => {
      it('should create the project, trigger GA event and return the project', async () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        const projectPayload = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = projectPayload;
        const createdProject = { id: 'baz' };
        ProjectServiceMock.create.withArgs('foo', projectPayload).resolves({ body: createdProject });
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        const res = await vm.register();

        // ASSERT
        expect(res).to.deep.equal(createdProject);
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'NewProject',
          eventLabel: 'foo',
        });
      });

      it('should set error on creation failure, and not trigger the GA event', async () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        const projectPayload = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = projectPayload;
        ProjectServiceMock.create.withArgs('foo', projectPayload).rejects({ err: 'errorz' });
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.register();

        // ASSERT
        expect(vm.error).to.deep.equal({ err: 'errorz' });
      });
    });

    describe('update', () => {
      it('should update the project, trigger GA event and return the project', async () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.project = { id: 'baz' };
        const projectPayload = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = projectPayload;
        const updatedProject = { id: 'baz' };
        ProjectServiceMock.update.withArgs('foo', 'baz', projectPayload).resolves({ body: updatedProject });
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        const res = await vm.update();

        // ASSERT
        expect(res).to.deep.equal(updatedProject);
        expect(vm.$ga.event).to.have.been.calledOnce;
        expect(vm.$ga.event).to.have.been.calledWith({
          eventCategory: 'ProjectRegistration',
          eventAction: 'UpdateProject',
          eventLabel: 'foo',
        });
      });

      it('should set error on update failure, and not trigger the GA event', async () => {
        // ARRANGE
        vm.event = { id: 'foo' };
        vm.project = { id: 'baz' };
        const projectPayload = {
          name: 'bar',
          supervisor: { type: 'supervisor' },
          members: [{
            type: 'member',
          }],
        };
        vm.projectPayload = projectPayload;
        ProjectServiceMock.update.withArgs('foo', 'baz', projectPayload).rejects({ err: 'errorz' });
        vm.$ga = {
          event: sandbox.stub(),
        };

        // ACT
        await vm.update();

        // ASSERT
        expect(vm.error).to.deep.equal({ err: 'errorz' });
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

    describe('getAge', () => {
      it('should return the age for the given dob', () => {
        // ARRANGE
        const dob = moment()
          .subtract(5, 'd')
          .subtract(2, 'm')
          .subtract(14, 'y')
          .toDate();

        // ASSERT
        expect(vm.getAge(dob)).to.equal(14);
      });
    });
  });

  describe('created()', () => {
    it('should add a beforeunload event listener and fetch dojos', () => {
      // ARRANGE
      sandbox.stub(window, 'addEventListener');
      sandbox.stub(vm, 'fetchDojos');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(window.addEventListener).to.have.been.calledOnce;
      expect(window.addEventListener).to.have.been.calledWith('beforeunload', vm.onBeforeUnload);
      expect(vm.fetchDojos).to.have.been.calledOnce;
    });

    it('should assign project to projectPayload if it exists', () => {
      // ARRANGE
      vm.project = {
        id: 'foo',
        supervisor: { type: 'supervisor' },
        members: [{
          type: 'member',
        }],
      };
      sandbox.stub(window, 'addEventListener');
      sandbox.stub(vm, 'fetchDojos');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.projectPayload).to.deep.equal({
        id: 'foo',
        supervisor: {},
        members: [{
          type: 'member',
        }],
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
