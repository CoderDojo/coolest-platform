exports.up = (knex, Promise) =>
  /* CREATE Project table */
  knex.schema
    .createTableIfNotExists('event', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.datetime('date');
      table.datetime('registration_start');
      table.datetime('registration_end');
      table.string('homepage');
      table.string('contact');
      table.timestamps(true, true);
    })

    /* CREATE Project table */
    .createTableIfNotExists('project', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('category');
      table.uuid('dojoId');
      table.timestamps(true, true);

      /* CREATE FKS */
      table
        .uuid('event_id')
        .index()
        .references('id')
        .inTable('event');
    })

    .createTableIfNotExists('user', (table) => {
      table.uuid('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.datetime('dob');
      table.string('gender');
      table.string('email');
      table.integer('phone');
      table.string('country');
      table.timestamps(true, true);
    })

    .createTableIfNotExists('user_family', (table) => {
      table.uuid('id').primary();
      table
        .uuid('parent_id')
        .index()
        .references('id')
        .inTable('user');
      table
        .uuid('children_id')
        .index()
        .references('id')
        .inTable('user');
    })

    .createTableIfNotExists('project_users', (table) => {
      table.uuid('id').primary();
      table
        .uuid('user_id')
        .index()
        .references('id')
        .inTable('user');
      table
        .uuid('project_id')
        .index()
        .references('id')
        .inTable('project');
    })

    .createTableIfNotExists('auth', (table) => {
      table.uuid('id').primary();
      table.uuid('token');
      table
        .uuid('user_id')
        .index()
        .references('id')
        .inTable('user');
    })
    .then(() => Promise.resolve());

exports.down = (knex, Promise) =>
  knex.schema
    .dropTable('event')
    .dropTable('project')
    .dropTable('user')
    .dropTable('user_family')
    .dropTable('project_users')
    .dropTable('auth')
    .then(() => Promise.resolve());
