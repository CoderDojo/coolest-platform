exports.up = (knex, Promise) => knex.schema.table('user', table => table.dropUnique('email'));
exports.down = (knex, Promise) => Promise.resolve();
