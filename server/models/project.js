const bookshelf = require('../database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Event = require('./events');

const Project = ModelBase.extend({
  tableName: 'project',
  event: () => {
    return this.belongsTo(Event);
  }
});

module.exports = Project;
