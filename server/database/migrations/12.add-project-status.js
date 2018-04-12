exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.text('status').defaultTo('pending');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('status');
  });
