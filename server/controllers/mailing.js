const mailer = require('@sendgrid/mail');
const htmlEntities = require('html-entities').AllHtmlEntities;
const { isEmpty } = require('lodash');

// Examples : https://github.com/sendgrid/sendgrid-nodejs/blob/master/test/typescript/mail.ts
class Mailing {
  constructor(config) {
    if (!isEmpty(config.apiKey)) {
      this.mailer = mailer;
      this.mailer.setApiKey(config.apiKey);
      this.mailer.setSubstitutionWrappers('{{', '}}');
    }
    this.categories = ['coolest-projects'];
    return this;
  }

  send(...args) {
    if (this.mailer) {
      return this.mailer.send(...args);
    }
    return Promise.resolve();
  }

  sendWelcomeEmail(creator, project, event) {
    const to = creator.email;
    return this.send({
      to,
      from: {
        email: event.contact,
        name: 'Coolest Projects',
      },
      reply_to: {
        email: event.contact,
        name: 'Coolest Projects Support',
      },
      subject: 'Welcome on CP',
      substitutions: {
        verificationSentence: event.requiresApproval ? 'You will be contacted by the Coolest Projects team if your project is accepted.' : '',
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        eventWebsite: event.homepage,
        eventManageLink: process.env.HOSTNAME,
        projectName: htmlEntities.encode(project.name),
      },
      categories: this.categories.concat([`cp-${event.slug}-registration`]),
      template_id: '6d20e65f-ae16-4b25-a17f-66d0398f474f',
    });
  }

  sendReturningAuthEmail(email, { slug, contact }, token) {
    return this.send({
      to: email,
      from: {
        email: contact,
        name: 'Coolest Projects',
      },
      reply_to: {
        email: contact,
        name: 'Coolest Projects Support',
      },
      subject: 'Welcome on CP',
      substitutions: {
        link: `${process.env.HOSTNAME}/events/${htmlEntities.encode(slug)}/my-projects?token=${token}`,
        contact,
      },
      categories: this.categories.concat([`cp-${slug}-returning-auth`]),
      template_id: '9f9ecdb3-df2b-403a-9f79-c80f91adf0ca',
    });
  }

  sendConfirmAttendanceEmail(projects, event) {
    const BATCH_SIZE = 1000;
    const emailPayloads = [];
    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      emailPayloads.push({
        personalizations: projects.slice(i, i + BATCH_SIZE).map((project) => {
          return {
            to: project.owner.email,
            substitutions: {
              projectName: htmlEntities.encode(project.name),
              attendingUrl: `${process.env.HOSTNAME}/events/${event.slug}/projects/${project.id}/status/confirmed`,
              notAttendingUrl: `${process.env.HOSTNAME}/events/${event.slug}/projects/${project.id}/status/canceled`,
            },
          };
        }),
        from: {
          email: event.contact,
          name: 'Coolest Projects',
        },
        reply_to: {
          email: event.contact,
          name: 'Coolest Projects Support',
        },
        substitutions: {
          eventName: event.name,
          eventLocation: event.location,
          eventDate: event.date,
          eventContact: event.contact,
          eventUrl: `${process.env.HOSTNAME}/events/${event.slug}`,
        },
        categories: this.categories.concat([`cp-${event.slug}-confirm-attendance`]),
        template_id: '3578d5f1-0212-4c98-94f3-8ab0b6735b22',
      });
    }
    return Promise.all(emailPayloads.map((payload) => {
      return this.send(payload);
    }));
  }
}

module.exports = Mailing;
