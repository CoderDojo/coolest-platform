const users = [
  {
    id: 'baz',
    firstName: 'Baz',
    lastName: 'Bar',
    dob: '1983-02-12T00:00:00.000Z',
    gender: 'male',
    email: 'baz@example.com',
    phone: '353851234567',
    country: 'IE',
    parent: {},
    type: 'supervisor'
  }
];

const events = [
  {
    id: 'cp-2018',
    name: 'Coolest Projects Dublin 2018',
    location: 'RDS Dublin',
    date: '2018-05-26T00:00:00.000Z',
    categories: [
      'Scratch',
      'Websites & Web Games',
      'Evolution',
    ],
    questions: ['social_project', 'educational_project', 'innovator_stage']
  }
];

const projects = [
  {
    id: 'sap',
    eventId: 'cp-2018',
    name: 'Super Awesome Project',
    category: 'scratch',
    dojoId: 'foo',
    users: [
      {
        firstName: 'Foo',
        lastName: 'Bar',
        dob: '2004-06-25T00:00:00.000Z',
        gender: 'female',
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
        type: 'member'
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
        type: 'supervisor'
      }
    ]
  },
  {
    id: 'scp',
    eventId: 'cp-2018',
    name: 'Sweet Cool Project',
    category: 'hardware',
    dojoId: 'foo',
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
        type: 'member'
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
        type: 'supervisor'
      }
    ]
  }
];

module.exports = {
  users,
  events,
  projects
};
