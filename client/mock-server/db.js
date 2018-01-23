const uuidv1 = require('uuid/v1');

const eventId = '4e285af0-fb81-11e7-8f56-d700b261c5a5';
const categories = {
  scratch: 'Scratch',
  web: 'Websites & Web Games',
  evo: 'Evolution',
  hardware: 'Hardware',
};
const orgs = ['coderdojo', 'codeclub', 'raspberryjam', 'pioneers'];

const users = [
  {
    id: uuidv1(),
    firstName: 'Baz',
    lastName: 'Bar',
    dob: '1983-02-12T00:00:00.000Z',
    gender: 'male',
    email: 'baz@example.com',
    phone: '353851234567',
    country: 'IE',
    parent: {},
    type: 'supervisor',
  },
];

const events = [
  {
    id: eventId,
    slug: 'cp-2018',
    name: 'Coolest Projects Dublin 2018',
    location: 'RDS Dublin',
    date: '2018-05-26T00:00:00.000Z',
    categories,
    questions: ['social_project', 'educational_project', 'innovator_stage']
  },
];

const projects = [
  {
    id: uuidv1(),
    eventId,
    name: 'Super Awesome Project',
    category: 'scratch',
    org: 'coderdojo',
    orgRef: uuidv1(),
    answers: {
      social_project: true,
      educational_project: false,
      innovator_stage: true,
    },
    owner: {
      firstName: 'Baz',
      lastName: 'Bar',
      email: 'baz@example.com',
      phone: '+353851234567',
      type: 'supervisor',
    },
    supervisor: {
      firstName: 'Baz',
      lastName: 'Bar',
      email: 'baz@example.com',
      phone: '+353851234567',
      type: 'supervisor',
    },
    users: [
      {
        firstName: 'Foo',
        lastName: 'Bar',
        dob: '2004-06-25T00:00:00.000Z',
        gender: 'female',
        type: 'member',
      },
      {
        firstName: 'Baz',
        lastName: 'Bar',
        email: 'baz@example.com',
        phone: '+353851234567',
        type: 'supervisor',
      },
    ],
  },
  {
    id: uuidv1(),
    eventId,
    name: 'Sweet Cool Project',
    category: 'hardware',
    org: 'codeclub',
    orgRef: uuidv1(),
    owner: {
      firstName: 'Baz',
      lastName: 'Bar',
      email: 'baz@example.com',
      phone: '+353851234567',
      type: 'supervisor',
    },
    supervisor: {
      firstName: 'Baz',
      lastName: 'Bar',
      email: 'baz@example.com',
      phone: '+353851234567',
      type: 'supervisor',
    },
    users: [
      {
        firstName: 'Qux',
        lastName: 'Bar',
        dob: '2001-10-08T00:00:00.000Z',
        gender: 'male',
        email: '',
        phone: '',
        country: 'IE',
        parent: {
          firstName: 'Baz',
          lastName: 'Bar',
          dob: '1983-02-12T00:00:00.000Z',
          gender: 'male',
          email: 'baz@example.com',
          phone: '353851234567',
        },
        type: 'member',
      },
      {
        firstName: 'Baz',
        lastName: 'Bar',
        dob: '1983-02-12T00:00:00.000Z',
        gender: 'male',
        email: 'baz@example.com',
        phone: '353851234567',
        country: 'IE',
        parent: {},
        type: 'supervisor',
      },
    ],
  },
];

for (let i = 0; i < 100; i += 1) {
  projects.push({
    id: uuidv1(),
    eventId,
    name: `Test Project ${i + 1}`,
    category: Object.keys(categories)[Math.floor(Math.random() * 3)],
    org: orgs[Math.floor(Math.random() * 3)],
    orgRef: uuidv1(),
    owner: {
      email: `testowner${i + 1}@example.com`,
      type: 'owner',
    },
    supervisor: {
      firstName: 'Test',
      lastName: `Supervisor ${i + 1}`,
      email: `testsupervisor${i + 1}@example.com`,
      phone: '+3531234567',
      type: 'supervisor',
    },
    users: [
      {
        email: `testowner${i + 1}@example.com`,
        type: 'owner',
      },
      {
        firstName: 'Test',
        lastName: `Member ${i + 1}-1`,
        email: `testmember${i + 1}-1@example.com`,
        dob: '2004-06-25T00:00:00.000Z',
        type: 'member',
      },
      {
        firstName: 'Test',
        lastName: `Member ${i + 1}-2`,
        email: `testmember${i + 1}-2@example.com`,
        dob: '2006-02-13T00:00:00.000Z',
        type: 'member',
      },
      {
        firstName: 'Test',
        lastName: `Supervisor ${i + 1}`,
        email: `testsupervisor${i + 1}@example.com`,
        phone: '+3531234567',
        type: 'supervisor',
      },
    ],
  });
}

module.exports = {
  users,
  events,
  projects,
};
