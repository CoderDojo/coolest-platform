import vueUnitHelper from 'vue-unit-helper';
import StateSelection from '@/project/StateSelection';

describe('StateSelection component', () => {
  let vm;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    vm = vueUnitHelper(StateSelection);
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('computed', () => {
    describe('state', () => {
      it('should return the value for other if selected is "other"', () => {
        // ARRANGE
        vm.selected = 'other';
        vm.other = 'foo';

        // ASSERT
        expect(vm.state).to.equal('foo');
      });

      it('should return the value for selected if selected is not "other"', () => {
        // ARRANGE
        vm.selected = 'CA';

        // ASSERT
        expect(vm.state).to.equal('CA');
      });
    });
  });

  describe('watchers', () => {
    describe('state', () => {
      it('should trigger an input event with the new value', () => {
        // ARRANGE
        vm.$emit = sandbox.stub();

        // ACT
        vm.$watchers.state('foo');

        // ASSERT
        expect(vm.$emit).to.have.been.calledOnce;
        expect(vm.$emit).to.have.been.calledWith('input', 'foo');
      });
    });

    describe('value', () => {
      it('should call update value', () => {
        // ARRANGE
        sandbox.stub(vm, 'updateValue');

        // ACT
        vm.$watchers.value();

        // ASSERT
        expect(vm.updateValue).to.have.been.calledOnce;
      });
    });
  });

  describe('methods', () => {
    describe('onBlur()', () => {
      it('should emit a blur event after 50ms', () => {
        // ARRANGE
        sandbox.stub(window, 'setTimeout').callsFake((cb) => { cb(); });
        vm.$emit = sandbox.stub();

        // ACT
        vm.onBlur();

        // ASSERT
        expect(window.setTimeout).to.have.been.calledOnce;
        expect(window.setTimeout).to.have.been.calledWith(sinon.match.func, 50);
        expect(vm.$emit).to.have.been.calledOnce;
        expect(vm.$emit).to.have.been.calledWith('blur');
      });
    });

    describe('onFocus()', () => {
      it('should clear the blur timeout', () => {
        // ARRANGE
        sandbox.stub(window, 'clearTimeout');

        // ACT
        vm.onFocus();

        // ASSERT
        expect(window.clearTimeout).to.have.been.calledOnce;
      });
    });

    describe('updateValue()', () => {
      it('should set selected to this.value if it matches a predefined state', () => {
        // ARRANGE
        vm.value = 'CA';

        // ACT
        vm.updateValue();

        // ASSERT
        expect(vm.selected).to.equal('CA');
      });

      it('should set selected to other and other to this.value if it does not match a predefined state', () => {
        // ARRANGE
        vm.value = 'foo';

        // ACT
        vm.updateValue();

        // ASSERT
        expect(vm.selected).to.equal('other');
        expect(vm.other).to.equal('foo');
      });
    });
  });

  describe('created()', () => {
    it('should call update value', () => {
      // ARRANGE
      sandbox.stub(vm, 'updateValue');

      // ACT
      vm.$watchers.value();

      // ASSERT
      expect(vm.updateValue).to.have.been.calledOnce;
    });
  });
});
