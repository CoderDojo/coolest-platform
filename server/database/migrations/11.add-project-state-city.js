exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.string('state');
    table.string('city');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('state');
    table.dropColumn('city');
  });
