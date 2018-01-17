exports.up = (knex, Promise) =>
  knex.schema.table('auth', (table) => {
    table.text('password');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('auth', (table) => {
    table.dropColumn('password');
  });
