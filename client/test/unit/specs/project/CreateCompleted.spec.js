import vueUnitHelper from 'vue-unit-helper';
import CreateProjectCompleted from '!!vue-loader?inject!@/project/CreateCompleted';

describe('Create Project Completed component', () => {
  let sandbox;
  let vm;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    vm = vueUnitHelper(CreateProjectCompleted({}));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {
    describe('eventDateFormatted', () => {
      it('should format the event date', () => {
        // ARRANGE
        vm.event = {
          date: '2017-05-12T00:00:00.000Z',
        };

        // ASSERT
        expect(vm.eventDateFormatted).to.equal('May 12, 2017');
      });
    });
  });
});
