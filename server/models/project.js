const bookshelf = require('../database');

const Project = bookshelf.Model.extend({
  tableName: 'project',
  event() {
    return this.belongsTo('Event');
  },
  members() {
    return this.belongsToMany('User').through('ProjectUsers');
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = bookshelf.model('Project', Project);
