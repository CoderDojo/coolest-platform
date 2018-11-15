import Vue from 'vue';
import EventService from '@/event/service';

describe('Event service', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('get()', () => {
    it('should get the details for the given eventSlug', async () => {
      // ARRANGE
      const eventSlug = 'cp2018';
      sandbox.stub(Vue.http, 'get')
        .withArgs(`/api/v1/events/${eventSlug}`)
        .resolves('success');

      // ACT
      const response = await EventService.get(eventSlug);

      // ASSERT
      expect(response).to.equal('success');
    });
  });
});
