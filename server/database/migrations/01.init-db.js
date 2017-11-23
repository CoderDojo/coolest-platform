exports.up = (knex, Promise) => {
  /* CREATE Project table */
  return knex.schema.createTableIfNotExists('event', function (table) {
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
  .createTableIfNotExists('project', function (table) {
    table.uuid('id').primary();
    table.string('name');
    table.string('category');
    table.uuid('dojoId');
    table.timestamps(true, true);

    /* CREATE FKS */
    table.uuid('event_id').index().references('id').inTable('event');
  })

  .createTableIfNotExists('user', function (table) {
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

  .createTableIfNotExists('user_family', function (table) {
    table.uuid('id').primary();
    table.uuid('parent_id').index().references('id').inTable('user');
    table.uuid('children_id').index().references('id').inTable('user');
  })

  .createTableIfNotExists('project_users', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').index().references('id').inTable('user');
    table.uuid('project_id').index().references('id').inTable('project');
  })

  .createTableIfNotExists('auth', function (table) {
    table.uuid('id').primary();
    table.uuid('token');
    table.uuid('user_id').index().references('id').inTable('user');
  })
  .then(() => {
    return Promise.resolve();
  });
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('event')
  .dropTable('project')
  .dropTable('user')
  .dropTable('user_family')
  .dropTable('project_users')
  .dropTable('auth')
  .then(() => {
    return Promise.resolve();
  });
}
