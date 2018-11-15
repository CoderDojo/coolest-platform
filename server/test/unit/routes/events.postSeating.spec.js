const proxy = require('proxyquire').noCallThru();

describe('router: event', () => {
  let handlers;
  describe('POST /:id/seats', () => {
    let handler;
    const eventController = class {};
    const projectController = class {};
    let sandbox;
    let next;
    before(() => {
      sandbox = sinon.createSandbox();
      handlers = (proxy('../../../routes/handlers/events', {
        '../../controllers/projects': projectController,
        '../../controllers/events': eventController,
      })).generateSeating;
      handler = (req, res, _next) => {
        return handlers[0](req, res, _next)
          .then(() => handlers[1](req, res, _next))
          .then(() => handlers[2](req, res, _next))
          .then(() => handlers[3](req, res, _next))
          .then(() => handlers[4](req, res, _next));
      };
    });
    beforeEach(() => {
      projectController.setSeatingPerCategory = sandbox.stub();
      eventController.get = sandbox.stub();
      eventController.update = sandbox.stub();
      next = sandbox.stub().callsFake((err) => {
        if (err) return Promise.reject(err);
        return Promise.resolve();
      });
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should set the seating for each categories', async () => {
      const refresh = sandbox.stub();
      const event = { attributes: { id: 1, seatingPrepared: false, categories: { SC: 'scratch' } }, refresh };
      const req = { params: { eventId: 1 } };
      const res = {
        app: { locals: {} },
        status: sandbox.stub(),
        send: sandbox.stub(),
      };

      res.status.returns(res);
      eventController.get.resolves(event);
      eventController.update.resolves();
      projectController.setSeatingPerCategory.resolves();

      await handler(req, res, next);

      expect(eventController.get).to.have.calledOnce;
      expect(projectController.setSeatingPerCategory).to.have.calledOnce;
      expect(projectController.setSeatingPerCategory).to.have.calledWith('SC');
      expect(eventController.update).to.have.calledOnce;
      expect(eventController.update).to.have.calledWith(event, { seatingPrepared: true });
      expect(event.refresh).to.have.been.calledOnce;
      expect(res.send).to.have.been.calledOnce;
      expect(res.send).to.have.been.calledWith(event);
      expect(next).to.have.been.callCount(4);
    });
    it('should not set the seating when it\'s already set', async () => {
      const event = { attributes: { id: 1, seatingPrepared: true, categories: { SC: 'scratch' } } };
      const req = { params: { eventId: 1 } };
      const res = {
        app: { locals: {} },
        status: sandbox.stub(),
        send: sandbox.stub(),
      };

      res.status.returns(res);
      eventController.get.resolves(event);
      eventController.update.resolves(Object.assign(
        { ...event.attributes },
        { seatingPrepared: true },
      ));
      projectController.setSeatingPerCategory.resolves();

      try {
        await handler(req, res, next);
      } catch (e) {
        expect(e.message).to.equal('Cannot regenerate the seating');
        expect(eventController.get).to.have.calledOnce;
        expect(projectController.setSeatingPerCategory).to.have.not.been.called;
        expect(eventController.update).to.not.have.been.called;
        expect(next).to.have.been.callCount(2);
      }
    });
    it('should not do anything if the event is wrong', async () => {
      const logger = {
        error: sandbox.stub(),
      };
      const req = { params: { eventId: 1 }, app: { locals: { logger } } };
      const res = {
        app: { locals: {} },
        status: sandbox.stub(),
        send: sandbox.stub(),
      };

      eventController.get.rejects();

      try {
        await handler(req, res, next);
      } catch (e) {
        expect(e.message).to.equal('Error while searching for an event.');
        expect(eventController.get).to.have.calledOnce;
        expect(projectController.setSeatingPerCategory).to.have.not.been.called;
        expect(eventController.update).to.not.have.been.called;
        expect(next).to.have.been.callCount(1);
      }
    });
    it('should throw on seat generation failure', async () => {
      const logger = {
        error: sandbox.stub(),
      };
      const event = { attributes: { id: 1, seatingPrepared: false, categories: { SC: 'scratch' } } };
      const req = { params: { eventId: 1 }, app: { locals: { logger } } };
      const res = {
        app: { locals: {} },
        status: sandbox.stub(),
        send: sandbox.stub(),
      };

      eventController.get.resolves(event);
      eventController.update.rejects();
      projectController.setSeatingPerCategory.resolves();

      try {
        await handler(req, res, next);
      } catch (e) {
        expect(e.message).to.equal('Error saving event status');
        expect(eventController.get).to.have.calledOnce;
        expect(projectController.setSeatingPerCategory).to.have.been.calledOnce;
        expect(eventController.update).to.have.been.calledOnce;
        expect(next).to.have.been.callCount(4);
      }
    });
    it('should throw if saving the event failed', async () => {
      const refresh = sandbox.stub();
      const event = { attributes: { id: 1, seatingPrepared: false, categories: { SC: 'scratch' } }, refresh };
      const req = { params: { eventId: 1 } };
      const res = {
        app: { locals: {} },
        status: sandbox.stub(),
        send: sandbox.stub(),
      };

      res.status.returns(res);
      eventController.get.resolves(event);
      eventController.update.resolves();
      projectController.setSeatingPerCategory.resolves();

      await handler(req, res, next);

      expect(eventController.get).to.have.calledOnce;
      expect(projectController.setSeatingPerCategory).to.have.calledOnce;
      expect(projectController.setSeatingPerCategory).to.have.calledWith('SC');
      expect(eventController.update).to.have.calledOnce;
      expect(eventController.update).to.have.calledWith(event, { seatingPrepared: true });
      expect(event.refresh).to.have.been.calledOnce;
      expect(res.send).to.have.been.calledOnce;
      expect(res.send).to.have.been.calledWith(event);
      expect(next).to.have.been.callCount(4);
    });
  });
});
