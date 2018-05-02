exports.up = async (knex, Promise) => {
  await knex.schema.createTableIfNotExists('projects_seating', (table) => {
    table.uuid('project_id')
      .index()
      .references('id')
      .inTable('project');
    table.string('seat');
  });
  return knex.schema.table('event', table =>
    table.boolean('seating_prepared').defaultTo(false));
};

exports.down = async (knex, Promise) => {
  await knex.schema.dropTable('projects_seating');
  return knex.schema.table('event', table =>
    table.dropColumn('seating_prepared'));
};
