exports.up = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.dropColumn('dojo_id');
    table.dropColumn('alternative_reference');
    table.string('org');
    table.text('org_ref');
  });

exports.down = (knex, Promise) =>
  knex.schema.table('project', (table) => {
    table.uuid('dojo_id');
    table.text('alternative_reference');
    table.dropColumn('org');
    table.dropColumn('org_ref');
  });
