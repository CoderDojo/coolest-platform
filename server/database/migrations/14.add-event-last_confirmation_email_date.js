exports.up = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.datetime('last_confirmation_email_date');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.dropColumn('last_confirmation_email_date');
  });
