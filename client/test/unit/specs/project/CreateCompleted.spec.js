import vueUnitHelper from 'vue-unit-helper';
import CreateProjectCompleted from '!!vue-loader?inject!@/project/CreateCompleted';

describe('Create Project Completed component', () => {
  let sandbox;
  let vm;
  let gaMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    gaMock = {
      event: sandbox.stub(),
    };
    vm = vueUnitHelper(CreateProjectCompleted({
      vue: { $ga: gaMock },
    }));
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
        expect(vm.eventDateFormatted).to.equal('May 12th');
      });
    });
  });

  describe('methods', () => {
    describe('trackTweet', () => {
      it('should send a GA event for when people click the tweet button', () => {
        // ACT
        vm.trackTweet();

        // ASSERT
        expect(gaMock.event).to.have.been.calledOnce;
        expect(gaMock.event).to.have.been.calledWithMatch({
          eventCategory: 'CreateProjectCompleted',
          eventAction: 'tweet',
        });
      });
    });
  });
});
