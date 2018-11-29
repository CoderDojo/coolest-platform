exports.up = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.integer('times_confirmation_email_sent').defaultTo(0).comment('Number of times a confirmation email has been sent; Used to shift content of email');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.dropColumn('times_confirmation_email_sent');
  });
