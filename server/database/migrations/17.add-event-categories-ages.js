exports.up = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.jsonb('categories_ages').comment('Object of array of ages per category');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('event', (table) => {
    table.dropColumn('categories_ages');
  });
