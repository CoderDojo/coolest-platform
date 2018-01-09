exports.seed = (knex, Promise) => knex.raw('UPDATE event SET questions = \'["social_project", "educational_project", "innovator_stage"]\'::jsonb WHERE slug=\'cp-2018\'');
