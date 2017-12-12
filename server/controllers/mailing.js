const mailer = require('@sendgrid/mail');
const { isEmpty } = require('lodash');

// Examples : https://github.com/sendgrid/sendgrid-nodejs/blob/master/test/typescript/mail.ts
class Mailing {
  constructor(config) {
    if (!isEmpty(config.apiKey)) {
      this.mailer = mailer;
      this.mailer.setApiKey(config.apiKey);
      this.mailer.setSubstitutionWrappers('{{', '}}');
    }
    return this;
  }

  send(...args) {
    if (this.mailer) {
      return this.mailer.send(...args);
    }
    return Promise.resolve();
  }

  sendWelcomeEmail(creator, project) {
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
        projectName: project.name,
      },
      category: ['coolest-project-registration'],
      template_id: '6d20e65f-ae16-4b25-a17f-66d0398f474f',
    });
  }
}


module.exports = Mailing;
