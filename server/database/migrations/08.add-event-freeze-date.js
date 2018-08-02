exports.up = (knex, Promise) => knex.schema.table('event', (table) => {
  table.datetime('freeze_date');
  table.string('email');
});
exports.down = (knex, Promise) => knex.schema.table('event', (table) => {
  table.dropColumn('freeze_date');
  table.dropColumn('email');
});
