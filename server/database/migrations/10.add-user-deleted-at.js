exports.up = (knex, Promise) =>
  knex.schema.table('user', (table) => {
    table.datetime('deleted_at');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('user', (table) => {
    table.dropColumn('deleted_at');
  });
