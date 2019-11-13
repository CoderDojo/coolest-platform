import vueUnitHelper from 'vue-unit-helper';
import EventUtils from '@/event/EventUtilsMixin';

describe('Event mixin', () => {
  let vm;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    vm = vueUnitHelper(EventUtils);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });
  describe('computed', () => {
    describe('formattedDate', () => {
      it('should return a human readable date', () => {
        vm.event = {
          date: '2018-04-04T16:00:00+01:00',
          tz: 'Europe/Dublin',
        };
        expect(vm.formattedDate).to.equal('Wednesday 4 April, 2018');
      });
    });
  });
});
