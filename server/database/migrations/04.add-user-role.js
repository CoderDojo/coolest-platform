exports.up = (knex, Promise) =>
  knex.schema.table('auth', (table) => {
    table.text('role');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('auth', (table) => {
    table.dropColumn('role');
  });
