exports.seed = (knex, Promise) => knex.raw('TRUNCATE TABLE "public".user CASCADE');
