const mailer = require('@sendgrid/mail');
const { isEmpty } = require('lodash');

// Examples : https://github.com/sendgrid/sendgrid-nodejs/blob/master/test/typescript/mail.ts
// NOTE: Please reflect any changes to variables on /EMAILS.md
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
      dynamic_template_data: {
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        eventWebsite: event.homepage,
        eventManageLink: process.env.HOSTNAME,
        projectName: project.name,
        ...Mailing.customisationValues(event),
      },
      categories: this.categories.concat([`cp-${event.slug}-registration`]),
      template_id: 'd-23da4e90859043bf81d7c3c1d4c14a5c',
    });
  }

  sendReturningAuthEmail(email, event, token) {
    return this.send({
      to: email,
      from: {
        email: event.contact,
        name: 'Coolest Projects',
      },
      reply_to: {
        email: event.contact,
        name: 'Coolest Projects Support',
      },
      subject: 'Welcome back on CP',
      dynamic_template_data: {
        link: `${process.env.HOSTNAME}/events/${event.slug}/my-projects?token=${token}`,
        contact: event.contact,
        ...Mailing.customisationValues(event),
      },
      categories: this.categories.concat([`cp-${event.slug}-returning-auth`]),
      template_id: 'd-fdb597373fb14b8fba7f7938a05ca0e3',
    });
  }

  sendConfirmAttendanceEmail(projects, event) {
    const BATCH_SIZE = 1000;
    const emailPayloads = [];
    const customValues = Mailing.customisationValues(event);
    const emailIteration = {
      firstTime: event.timesConfirmationEmailSent === 1,
      secondTime: event.timesConfirmationEmailSent === 2,
      lastTime: event.timesConfirmationEmailSent > 2,
    };
    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      emailPayloads.push({
        personalizations: projects.slice(i, i + BATCH_SIZE).map((project) => {
          const payload = {
            to: project.owner.email,
            // Bugfix for https://github.com/sendgrid/sendgrid-nodejs/issues/747
            substitutions: { },
            dynamic_template_data: {
              projectName: project.name,
              attendingUrl: `${process.env.HOSTNAME}/events/${event.slug}/projects/${project.id}/status/confirmed`,
              notAttendingUrl: `${process.env.HOSTNAME}/events/${event.slug}/projects/${project.id}/status/canceled`,
              ...customValues,
            },
          };
          // We can't set it to an empty array, Sendgrid chokes on it
          if (project.supervisor.email !== project.owner.email) {
            payload.cc = [project.supervisor.email];
          }
          return payload;
        })
          // Bugfix for Sendgrid mixing up the headers
          .sort((perso1, perso2) => {
            if (perso2.cc) {
              return -1;
            }
            if (perso1.cc) {
              return 1;
            }
            return 0;
          }),
        from: {
          email: event.contact,
          name: 'Coolest Projects',
        },
        reply_to: {
          email: event.contact,
          name: 'Coolest Projects Support',
        },
        dynamic_template_data: {
          eventName: event.name,
          eventLocation: event.location,
          eventDate: event.date,
          eventContact: event.contact,
          eventUrl: `${process.env.HOSTNAME}/events/${event.slug}`,
          ...emailIteration,
          ...customValues,
        },
        categories: this.categories.concat([`cp-${event.slug}-${event.timesConfirmationEmailSent}-confirm-attendance`]),
        template_id: 'd-47688ce306734a92bf6211b0e9bfccc9',
      });
    }
    return Promise.all(emailPayloads.map((payload) => {
      return this.send(payload);
    }));
  }

  static customisationValues(event) {
    return {
      [event.slug]: true,
      requiresApproval: event.requiresApproval,
    };
  }

  sendNewAdminEmail(email, password) {
    const sender = process.env.MASTER_ADMIN_EMAIL;
    return this.send({
      to: email,
      from: {
        email: sender,
        name: 'Coolest Projects',
      },
      reply_to: {
        email: sender,
        name: 'Coolest Projects Support',
      },
      subject: 'Welcome on CP',
      dynamic_template_data: {
        link: `${process.env.HOSTNAME}/admin`,
        password,
      },
      categories: this.categories.concat(['cp-new-admin']),
      template_id: 'd-65f020be46f54bb8a369dfd356449a1e',
    });
  }
}

module.exports = Mailing;
