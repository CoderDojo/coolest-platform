exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.text('description');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('description');
  });
