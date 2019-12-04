import vueUnitHelper from 'vue-unit-helper';
import AdminProjectsAdvanced from '!!vue-loader?inject!@/admin/projects/Advanced';

describe('Admin Projects Advanced component', () => {
  let sandbox;
  let vm;
  let MockAdminEventsService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    MockAdminEventsService = {
      sendConfirmAttendanceEmails: sandbox.stub(),
    };
    vm = vueUnitHelper(AdminProjectsAdvanced({
      '@/admin/events/service': MockAdminEventsService,
    }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {});

  describe('watchers', () => {});

  describe('methods', () => {
    describe('sendConfirmAttendanceEmails', () => {
      it('should send the confirmation email if the user confirms', async () => {
        // ARRANGE
        let resolvePromise;
        const fakePromise = new Promise((resolve, reject) => {
          resolvePromise = () => {
            resolve();
          };
        });
        sandbox.stub(window, 'confirm').returns(true);
        MockAdminEventsService.sendConfirmAttendanceEmails.callsFake(() => fakePromise);
        vm.event = {
          id: 'foo',
        };

        // ACT
        vm.sendConfirmAttendanceEmails();

        // ASSERT
        expect(vm.confirmationEmailSendState).to.equal('sending');

        // ACT
        resolvePromise();
        await fakePromise;

        // ASSERT
        expect(vm.confirmationEmailSendState).to.equal('sent');
        expect(MockAdminEventsService.sendConfirmAttendanceEmails).to.have.been
          .calledOnce;
        expect(MockAdminEventsService.sendConfirmAttendanceEmails).to.have.been.calledWith('foo');
      });

      it('should do nothing if the user does not confirm', async () => {
        // ARRANGE
        sandbox.stub(window, 'confirm').returns(false);

        // ACT
        vm.sendConfirmAttendanceEmails();

        // ASSERT
        expect(vm.confirmationEmailSendState).to.equal('visible');
        expect(MockAdminEventsService.sendConfirmAttendanceEmails).to.not.have
          .been.called;
      });

      it('should include the last time the emails were sent if it is set', async () => {
        // ARRANGE
        vm.event = {
          lastConfirmationEmailDate: 'some date',
        };
        sandbox.stub(window, 'confirm').returns(false);

        // ACT
        vm.sendConfirmAttendanceEmails();

        // ASSERT
        expect(window.confirm).to.have.been.calledWith('Clicking OK will send emails to all pending projects. The last emails were sent on some date');
      });
    });
  });
});
