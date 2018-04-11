exports.up = (knex, Promise) => knex.schema.table('event', table => table.string('tz'));
exports.down = (knex, Promise) => knex.schema.table('event', table => table.dropColumn('tz'));
