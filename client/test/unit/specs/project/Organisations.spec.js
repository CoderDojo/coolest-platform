import vueUnitHelper from 'vue-unit-helper';
import Organisations from 'inject-loader!@/project/Organisations';

describe('Organisations mixin', () => {
  let sandbox;
  let vm;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    vm = vueUnitHelper(Organisations().default);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('computed', () => {
    describe('orgRegistration', () => {
      it('should return the formatted organisations for project registration', () => {
        // ASSERT
        expect(vm.orgRegistration).to.eql([{
          id: 'coderdojo',
          text: 'Attend a CoderDojo',
        }, {
          id: 'codeclub',
          text: 'Attend a Code Club',
        }, {
          id: 'raspberryjam',
          text: 'Attend a Raspberry Jam',
        }, {
          id: 'certified_educator',
          text: 'Student of Raspberry Pi Certified Educator',
        }, {
          id: 'other',
          text: 'Other',
        }]);
      });
    });
    describe('orgListing', () => {
      it('should return the formatted organisations for admin filtering', () => {
        // ASSERT
        expect(vm.orgListing).to.eql([{
          id: 'coderdojo',
          text: 'CoderDojo',
        }, {
          id: 'codeclub',
          text: 'Code Club',
        }, {
          id: 'raspberryjam',
          text: 'Raspberry Jam',
        }, {
          id: 'certified_educator',
          text: 'Raspberry Pi Certified Educator',
        }, {
          id: 'other',
          text: 'Other',
        }]);
      });
    });
  });
});
