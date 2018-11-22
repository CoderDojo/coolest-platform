const uuid = require('uuid/v4');

exports.seed = (knex, Promise) =>
  knex.raw('TRUNCATE TABLE project CASCADE').then(() => {
    return knex('event').where({
      slug: 'cp-2018',
    }).select();
  }).then((events) => {
    const eventId = events[0].id;
    const categories = events[0].categories;
    const genders = ['male', 'female', 'undisclosed'];
    const orgs = ['coderdojo', 'codeclub', 'raspberryjam', 'other'];

    function createProject(i) {
      const ownerId = uuid();
      const memberId = uuid();
      const supervisorId = uuid();
      const projectId = uuid();

      return Promise.resolve()
        .then(() => {
          return knex('public.user').insert([
            {
              id: ownerId,
              email: `testowner${i + 1}@sink.sendgrid.net`,
            },
            {
              id: memberId,
              first_name: 'Test',
              last_name: `Member ${i + 1}`,
              email: `testmember${i + 1}@sink.sendgrid.net`,
              dob: new Date(
                new Date().setFullYear(
                  new Date().getFullYear() - Math.floor(Math.random() * 18)),
              ).toISOString(),
              gender: genders[Math.floor(Math.random() * 3)],
            },
            {
              id: supervisorId,
              first_name: 'Test',
              last_name: `Supervisor ${i + 1}`,
              email: `testsupervisor${i + 1}@sink.sendgrid.net`,
              phone: '+353851234567',
            },
          ]);
        })
        .then(() => {
          return knex('project').insert({
            id: projectId,
            event_id: eventId,
            name: `Test Project ${i + 1}`,
            category: Object.keys(categories)[Math.floor(Math.random() * 2)],
            org: orgs[Math.floor(Math.random() * 5)],
            org_ref: uuid(),
          });
        })
        .then(() => {
          return knex('project_users').insert([
            {
              id: uuid(),
              project_id: projectId,
              user_id: ownerId,
              type: 'owner',
            },
            {
              id: uuid(),
              project_id: projectId,
              user_id: memberId,
              type: 'member',
            },
            {
              id: uuid(),
              project_id: projectId,
              user_id: supervisorId,
              type: 'supervisor',
            },
          ]);
        });
    }

    const inserts = [];

    for (let i = 0; i < 110; i += 1) {
      inserts.push(createProject(i));
    }

    return Promise.all(inserts);
  });
