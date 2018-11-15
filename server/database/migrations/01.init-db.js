exports.up = async (knex, Promise) => {
  // NOTE: do not reuse schema : https://github.com/tgriesser/knex/issues/1509#issuecomment-289028026
  if (!await knex.schema.hasTable('event')) {
    await knex.schema.createTable('event', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('slug');
      table.string('location');
      table.datetime('date');
      table.datetime('registration_start');
      table.datetime('registration_end');
      table.jsonb('categories');
      table.string('homepage');
      table.string('contact');
      table.timestamps(true, true);
    });
  }
  if (!await knex.schema.hasTable('project')) {
    await knex.schema.createTable('project', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('category');
      table.uuid('dojo_id');
      table.timestamps(true, true);

      /* CREATE FKS */
      table
        .uuid('event_id')
        .index()
        .references('id')
        .inTable('event');
    });
  }
  if (!await knex.schema.hasTable('user')) {
    await knex.schema.createTable('user', (table) => {
      table.uuid('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.datetime('dob');
      table.string('gender');
      table.string('special_requirements');
      table.string('email').unique();
      table.string('phone');
      table.string('country');
      table.timestamps(true, true);
    });
  }
  if (!await knex.schema.hasTable('user_family')) {
    await knex.schema.createTable('user_family', (table) => {
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
    });
  }
  if (!await knex.schema.hasTable('project_users')) {
    await knex.schema.createTable('project_users', (table) => {
      table.uuid('id').primary();
      table.string('type');
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
    });
  }
  if (!await knex.schema.hasTable('auth')) {
    await knex.schema.createTable('auth', (table) => {
      table.uuid('id').primary();
      table.string('token');
      table.timestamps(true, true);
      table
        .uuid('user_id')
        .index()
        .references('id')
        .inTable('user');
    });
  }
  return Promise.resolve();
};

exports.down = (knex, Promise) =>
  knex.schema
    .dropTable('event')
    .dropTable('project')
    .dropTable('user')
    .dropTable('user_family')
    .dropTable('project_users')
    .dropTable('auth')
    .then(() => Promise.resolve());
