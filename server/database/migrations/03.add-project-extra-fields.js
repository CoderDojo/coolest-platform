exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.text('alternative_reference');
    table.jsonb('answers');
  })
    .table('event', (table) => {
      table.jsonb('questions');
    });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('alternative_reference');
    table.dropColumn('answers');
  })
    .table('event', (table) => {
      table.dropColumn('questions');
    });
