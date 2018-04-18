exports.up = (knex, Promise) => knex.schema.table('event', table => table.string('external_ticketing_uri'));
exports.down = (knex, Promise) => knex.schema.table('event', table => table.dropColumn('external_ticketing_uri'));
