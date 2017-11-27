const bookshelf = require('../database');

const ProjectUsers = bookshelf.Model.extend({
  tableName: 'project_users',
  event() {
    return this.hasOne('Project');
  },
  members() {
    return this.hasOne('User');
  },
  uuid: true,
  // hasTimestamps: true,
});

module.exports = bookshelf.model('ProjectUsers', ProjectUsers);
