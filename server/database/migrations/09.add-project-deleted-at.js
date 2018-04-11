exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.datetime('deleted_at');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('deleted_at');
  });
