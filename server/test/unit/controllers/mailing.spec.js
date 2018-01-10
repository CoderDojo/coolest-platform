const proxy = require('proxyquire').noCallThru();

describe('mailing controllers', () => {
  const sandbox = sinon.sandbox.create();
  describe('get', () => {
    let setSubstitutionWrappersStub;
    let sendStub;
    let setApiKeyStub;
    let creatorMock;

    before(() => {
      setSubstitutionWrappersStub = sandbox.stub();
      setApiKeyStub = sandbox.stub();
      sendStub = sandbox.stub();
      creatorMock = {
        email: 'doubidou@example.com',
      };
    });

    beforeEach(() => {
      sandbox.reset();
    });

    describe('constructor', () => {
      it('should init with api key', async () => {
        // DATA
        const apiKey = 'cp-2018';
        const configMock = { apiKey };
        // STUBS
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
          },
        });
        // ACT
        const mailingController = new Mailing(configMock);

        // Build the request
        expect(setApiKeyStub).to.have.been.calledOnce;
        expect(setApiKeyStub).to.have.been.calledWith(apiKey);
        expect(setSubstitutionWrappersStub).to.have.been.calledOnce;
        expect(setSubstitutionWrappersStub).to.have.been.calledWith('{{', '}}');
        expect(mailingController.mailer).to.be.not.undefined;
      });

      it('should init without api key', async () => {
        // DATA
        const apiKey = '';
        const configMock = { apiKey };
        // STUBS
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
          },
        });
        // ACT
        const mailingController = new Mailing(configMock);

        // Build the request
        expect(setApiKeyStub).to.not.have.been.called;
        expect(setSubstitutionWrappersStub).to.not.have.been.called;
        expect(mailingController.mailer).to.be.undefined;
      });
    });

    describe('sendWelcomeEmail', () => {
      it('should call the mailer instance', async () => {
        // DATA
        const apiKey = 'apiKey';
        const configMock = { apiKey };
        const mockProject = {
          name: 'myLittleProject',
          users: [
            { type: 'supervisor', email: 'doubidou@example.com' },
          ],
        };
        // STUBS
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
            send: sendStub,
          },
        });
        // ACT
        const mailingController = new Mailing(configMock);
        mailingController.sendWelcomeEmail(creatorMock, mockProject);

        // Build the request
        expect(mailingController.mailer.send).to.have.been.calledOnce;
        expect(mailingController.mailer.send).to.have.been.calledWith({
          to: 'doubidou@example.com',
          from: {
            email: 'enquiries+bot@coderdojo.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'enquiries+bot@coderdojo.org',
            name: 'Coolest Projects Support',
          },
          subject: 'Welcome on CP',
          substitutions: {
            projectName: 'myLittleProject',
          },
          categories: ['coolest-projects', 'cp-registration'],
          template_id: '6d20e65f-ae16-4b25-a17f-66d0398f474f',
        });
      });
    });
  });
});
