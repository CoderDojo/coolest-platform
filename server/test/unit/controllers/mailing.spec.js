const proxy = require('proxyquire').noCallThru();

describe('mailing controllers', () => {
  const sandbox = sinon.createSandbox();
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
        const mockEvent = {
          name: 'cp 2018',
          slug: 'cp-2018',
          date: 'Friday 6th',
          location: 'there',
          homepage: 'cp.orgs/usa',
          requiresApproval: true,
          contact: 'help@coolestprojects.org',
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
        mailingController.sendWelcomeEmail(creatorMock, mockProject, mockEvent);

        // Build the request
        expect(mailingController.mailer.send).to.have.been.calledOnce;
        expect(mailingController.mailer.send).to.have.been.calledWith({
          to: 'doubidou@example.com',
          from: {
            email: 'help@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'help@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          subject: 'Welcome on CP',
          dynamic_template_data: {
            projectName: 'myLittleProject',
            eventName: mockEvent.name,
            eventDate: mockEvent.date,
            eventLocation: mockEvent.location,
            eventWebsite: mockEvent.homepage,
            eventManageLink: process.env.HOSTNAME,
            requiresApproval: true,
            'cp-2018': true,
          },
          categories: ['coolest-projects', 'cp-cp-2018-registration'],
          template_id: 'd-23da4e90859043bf81d7c3c1d4c14a5c',
        });
      });
    });

    describe('sendReturningAuthEmail', () => {
      it('should call the mailer instance', async () => {
        // DATA
        const apiKey = 'apiKey';
        const configMock = { apiKey };
        const email = 'dada@da';
        const slug = 'cp-2018';
        const contact = 'help@coolestprojects.org';
        const event = { slug, contact, requiresApproval: true };
        const token = 'newtoken';
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
        mailingController.sendReturningAuthEmail(email, event, token);

        // Build the request
        expect(mailingController.mailer.send).to.have.been.calledOnce;
        expect(mailingController.mailer.send).to.have.been.calledWith({
          to: 'dada@da',
          from: {
            email: 'help@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'help@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          subject: 'Welcome back on CP',
          dynamic_template_data: {
            link: 'http://platform.local/events/cp-2018/my-projects?token=newtoken',
            contact,
            requiresApproval: true,
            'cp-2018': true,
          },
          categories: ['coolest-projects', 'cp-cp-2018-returning-auth'],
          template_id: 'd-fdb597373fb14b8fba7f7938a05ca0e3',
        });
      });
    });

    describe('sendConfirmAttendanceEmail', () => {
      function generateProjects(amount, supervisorDiffers = false) {
        const projects = [];
        for (let i = 0; i < amount; i += 1) {
          const supervisorEmail = supervisorDiffers ? `supervisor${i}@example.com` : `owner${i}@example.com`;
          projects.push({
            owner: {
              email: `owner${i}@example.com`,
            },
            supervisor: {
              email: supervisorEmail,
            },
            name: `Sample Project ${i}`,
            id: `${i}`,
          });
        }
        return projects;
      }

      function generateEmailPersonalizations(amount, eventSlug, offset = 0) {
        const personalizations = [];
        for (let i = offset; i < amount + offset; i += 1) {
          personalizations.push({
            to: `owner${i}@example.com`,
            cc: [],
            substitutions: { },
            dynamic_template_data: {
              projectName: `Sample Project ${i}`,
              attendingUrl: `${process.env.HOSTNAME}/events/${eventSlug}/projects/${i}/status/confirmed`,
              notAttendingUrl: `${process.env.HOSTNAME}/events/${eventSlug}/projects/${i}/status/canceled`,
              requiresApproval: false,
              intl: true,
            },
          });
        }
        return personalizations;
      }

      it('should split emails into batches of 1000 and call the mailer instance with the correct payload', () => {
        // ARRANGE
        const configMock = { apiKey: 'apiKey' };
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
            send: sendStub,
          },
        });
        const event = {
          name: 'International',
          location: 'Over there',
          date: 'Some time',
          contact: 'hello@coolestprojects.org',
          slug: 'intl',
          timesConfirmationEmailSent: 1,
          requiresApproval: false,
        };
        const projects = generateProjects(2400);
        const mailingController = new Mailing(configMock);

        // ACT
        mailingController.sendConfirmAttendanceEmail(projects, event);

        // ASSERT
        expect(sendStub).to.have.been.calledThrice;
        expect(sendStub.getCall(0).args[0].personalizations[0].to).to.equal('owner0@example.com');
        expect(sendStub.getCall(0).args[0].personalizations[999].to).to.equal('owner999@example.com');
        expect(sendStub).to.have.been.calledWith({
          personalizations: generateEmailPersonalizations(1000, 'intl'),
          from: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          dynamic_template_data: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
            requiresApproval: false,
            emailIteration: 1,
            intl: true,
          },
          categories: ['coolest-projects', 'cp-intl-1-confirm-attendance'],
          template_id: 'd-47688ce306734a92bf6211b0e9bfccc9',
        });
        expect(sendStub.getCall(1).args[0].personalizations[0].to).to.equal('owner1000@example.com');
        expect(sendStub.getCall(1).args[0].personalizations[999].to).to.equal('owner1999@example.com');
        expect(sendStub).to.have.been.calledWith({
          personalizations: generateEmailPersonalizations(1000, 'intl', 1000),
          from: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          dynamic_template_data: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
            requiresApproval: false,
            emailIteration: 1,
            intl: true,
          },
          categories: ['coolest-projects', 'cp-intl-1-confirm-attendance'],
          template_id: 'd-47688ce306734a92bf6211b0e9bfccc9',
        });
        expect(sendStub.getCall(2).args[0].personalizations[0].to).to.equal('owner2000@example.com');
        expect(sendStub.getCall(2).args[0].personalizations[399].to).to.equal('owner2399@example.com');
        expect(sendStub).to.have.been.calledWith({
          personalizations: generateEmailPersonalizations(400, 'intl', 2000),
          from: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          dynamic_template_data: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
            requiresApproval: false,
            emailIteration: 1,
            intl: true,
          },
          categories: ['coolest-projects', 'cp-intl-1-confirm-attendance'],
          template_id: 'd-47688ce306734a92bf6211b0e9bfccc9',
        });
      });
      it('should set the cc to the supervisor', () => {
        // ARRANGE
        const configMock = { apiKey: 'apiKey' };
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
            send: sendStub,
          },
        });
        const event = {
          name: 'International',
          location: 'Over there',
          date: 'Some time',
          contact: 'hello@coolestprojects.org',
          slug: 'intl',
          timesConfirmationEmailSent: 1,
          requiresApproval: false,
        };
        const projects = generateProjects(2, true);
        const mailingController = new Mailing(configMock);

        // ACT
        mailingController.sendConfirmAttendanceEmail(projects, event);

        // ASSERT
        expect(sendStub).to.have.been.calledOnce;
        expect(sendStub.getCall(0).args[0].personalizations[0].cc).to.eql(['supervisor0@example.com']);
        expect(sendStub.getCall(0).args[0].personalizations[1].cc).to.eql(['supervisor1@example.com']);
      });
    });

    describe('customisationValue', () => {
      it('should return values from the event config', () => {
        const Mailing = proxy('../../../controllers/mailing', {
          '@sendgrid/mail': {
            setApiKey: setApiKeyStub,
            setSubstitutionWrappers: setSubstitutionWrappersStub,
          },
        });
        const event = {
          name: 'International',
          location: 'Over there',
          date: 'Some time',
          contact: 'hello@coolestprojects.org',
          slug: 'intl',
          requiresApproval: false,
        };
        expect(Mailing.customisationValues(event)).to.eql({
          intl: true,
          requiresApproval: false,
        });
      });
    });
    describe('sendNewAdminEmail', () => {
      it('should call the mailer instance', async () => {
        // DATA
        const apiKey = 'apiKey';
        const configMock = { apiKey };
        const email = 'dada@da';
        const password = 'password';
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
        mailingController.sendNewAdminEmail(email, password);

        // Build the request
        expect(mailingController.mailer.send).to.have.been.calledOnce;
        expect(mailingController.mailer.send).to.have.been.calledWith({
          to: 'dada@da',
          from: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'hello@coolestprojects.org',
            name: 'Coolest Projects Support',
          },
          subject: 'Welcome on CP',
          dynamic_template_data: {
            link: 'http://platform.local/admin',
            password,
          },
          categories: ['coolest-projects', 'cp-new-admin'],
          template_id: 'd-65f020be46f54bb8a369dfd356449a1e',
        });
      });
    });
  });
});
