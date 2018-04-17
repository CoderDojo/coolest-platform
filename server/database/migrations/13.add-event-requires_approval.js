exports.up = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.boolean('requires_approval').defaultTo(false);
  });

exports.down = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.dropColumn('requires_approval');
  });
