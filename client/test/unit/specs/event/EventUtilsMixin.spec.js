import vueUnitHelper from 'vue-unit-helper';
import EventUtils from '@/event/EventUtilsMixin';

describe('Event mixin', () => {
  let vm;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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
          date: '2018-04-04T16:00:00',
          tz: 'Europe/Dublin',
        };
        expect(vm.formattedDate).to.equal('Wednesday, April 4, 2018 4:00 PM IST');
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
  });
});
