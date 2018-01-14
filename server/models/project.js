const bookshelf = require('../database');
const logger = require('../util/logger');

const Project = bookshelf.Model.extend({
  tableName: 'project',
  event() {
    return this.belongsTo('Event');
  },
  members() {
    return this.belongsToMany('User').through('ProjectUsers');
  },
  owner() {
    return this.hasOne('ProjectUsers').query(q => q.where('type', 'owner'));
  },
  isOwner(userId) {
    let isOwner = false;
    if (this.relations.owner) {
      isOwner = this.relations.owner.attributes.userId === userId;
    } else {
      logger.error('Unexpected usage of isOwner');
    }
    return isOwner;
  },
  uuid: true,
  hasTimestamps: true,
});

module.exports = bookshelf.model('Project', Project);
