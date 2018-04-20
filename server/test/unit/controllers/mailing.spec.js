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
        const mockEvent = {
          name: 'cp 2018',
          slug: 'cp-2018',
          date: 'Friday 6th',
          location: 'there',
          homepage: 'cp.orgs/usa',
          requiresApproval: false,
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
          substitutions: {
            verificationSentence: '',
            projectName: 'myLittleProject',
            eventName: mockEvent.name,
            eventDate: mockEvent.date,
            eventLocation: mockEvent.location,
            eventWebsite: mockEvent.homepage,
            eventManageLink: process.env.HOSTNAME,
          },
          categories: ['coolest-projects', 'cp-cp-2018-registration'],
          template_id: '6d20e65f-ae16-4b25-a17f-66d0398f474f',
        });
      });
      it('should call the mailer instance with the extra sentence set', async () => {
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
          contact: 'enquiries+bot@coderdojo.org',
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
            email: 'enquiries+bot@coderdojo.org',
            name: 'Coolest Projects',
          },
          reply_to: {
            email: 'enquiries+bot@coderdojo.org',
            name: 'Coolest Projects Support',
          },
          subject: 'Welcome on CP',
          substitutions: {
            verificationSentence: 'You will be contacted by the Coolest Projects team if your project is accepted.',
            projectName: 'myLittleProject',
            eventName: mockEvent.name,
            eventDate: mockEvent.date,
            eventLocation: mockEvent.location,
            eventWebsite: mockEvent.homepage,
            eventManageLink: process.env.HOSTNAME,
          },
          categories: ['coolest-projects', 'cp-cp-2018-registration'],
          template_id: '6d20e65f-ae16-4b25-a17f-66d0398f474f',
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
        const event = { slug, contact };
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
          subject: 'Welcome on CP',
          substitutions: {
            link: 'http://platform.local/events/cp-2018/my-projects?token=newtoken',
            contact,
          },
          categories: ['coolest-projects', 'cp-cp-2018-returning-auth'],
          template_id: '9f9ecdb3-df2b-403a-9f79-c80f91adf0ca',
        });
      });
    });

    describe('sendConfirmAttendanceEmail', () => {
      function generateProjects(amount) {
        const projects = [];
        for (let i = 0; i < amount; i += 1) {
          projects.push({
            owner: {
              email: `owner${i}@example.com`,
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
            substitutions: {
              projectName: `Sample Project ${i}`,
              attendingUrl: `${process.env.HOSTNAME}/events/${eventSlug}/projects/${i}/status/confirmed`,
              notAttendingUrl: `${process.env.HOSTNAME}/events/${eventSlug}/projects/${i}/status/canceled`,
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
          substitutions: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
          },
          categories: ['coolest-projects', 'cp-intl-confirm-attendance'],
          template_id: '3578d5f1-0212-4c98-94f3-8ab0b6735b22',
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
          substitutions: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
          },
          categories: ['coolest-projects', 'cp-intl-confirm-attendance'],
          template_id: '3578d5f1-0212-4c98-94f3-8ab0b6735b22',
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
          substitutions: {
            eventName: 'International',
            eventLocation: 'Over there',
            eventDate: 'Some time',
            eventContact: 'hello@coolestprojects.org',
            eventUrl: `${process.env.HOSTNAME}/events/intl`,
          },
          categories: ['coolest-projects', 'cp-intl-confirm-attendance'],
          template_id: '3578d5f1-0212-4c98-94f3-8ab0b6735b22',
        });
      });
    });
  });
});
