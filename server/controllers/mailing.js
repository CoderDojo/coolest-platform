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
        email: 'enquiries+bot@coderdojo.org',
        name: 'Coolest Projects',
      },
      reply_to: {
        email: 'enquiries+bot@coderdojo.org',
        name: 'Coolest Projects Support',
      },
      subject: 'Welcome on CP',
      substitutions: {
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

  sendReturningAuthEmail(email, slug, token) {
    return this.send({
      to: email,
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
        email,
        link: `${process.env.HOSTNAME}/events/${htmlEntities.encode(slug)}/my-projects?token=${token}`,
      },
      categories: this.categories.concat([`cp-${slug}-returning-auth`]),
      template_id: '9f9ecdb3-df2b-403a-9f79-c80f91adf0ca',
    });
  }
}

module.exports = Mailing;
