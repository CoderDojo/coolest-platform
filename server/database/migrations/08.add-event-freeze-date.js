exports.up = (knex, Promise) => knex.schema.table('event', (table) => {
  table.datetime('freeze_date');
});
exports.down = (knex, Promise) => knex.schema.table('event', (table) => {
  table.dropColumn('freeze_date');
});
