const ProjectModel = require('../models/project');
const ProjectUsersModel = require('../models/projectUsers');
const UserModel = require('../models/user');
const { pick, differenceWith, intersectionWith } = require('lodash');
const snakeCase = require('decamelize');

class Project {
  static post(creator, project, eventId) {
    // TODO : apply endpoint validation
    // TODO : transaction
    // TODO : split into handler 
    const projectPayload = Object.assign(
      {},
      pick(project, ['name', 'category', 'description', 'org', 'orgRef', 'answers']),
      { eventId },
    );
    const newProject = new ProjectModel(projectPayload);
    const promises = [];
    const users = [];
    // Save every user from the form
    project.users.forEach((user) => {
      // The id is carefully removed to not overwrite an user
      const userPayload = pick(user, [
        'firstName',
        'lastName',
        'specialRequirements',
        'dob',
        'gender',
        'email',
        'phone',
        'country',
      ]);
      const newUser = new UserModel(userPayload)
        .save()
        .then((_user) => {
          users.push(Object.assign(_user.toJSON(), { type: user.type }));
          // We return the association to be saved in ProjectUsers
          return Promise.resolve({ user_id: _user.id, type: user.type });
        });
      promises.push(newUser);
    });

    // Add owner to relationship but not to final payload ([users])
    promises.push(Promise.resolve({ user_id: creator.id, type: 'owner' }));

    return newProject.save().then(_project =>
      Promise.all(promises)
        .then(associations => new ProjectModel({ id: _project.id }).members().attach(associations))
        .then(() => Object.assign(_project.toJSON(), { users })));
  }

  static update(originalProject, project) {
    return originalProject.save(project, { method: 'update', patch: true });
  }

  static get(identifier, withRelated) {
    return ProjectModel.where(identifier).fetch({ withRelated });
  }

  static removeUsers(projectId, userIds) {
    return ProjectUsersModel
      .where('user_id', 'IN', userIds)
      .where('project_id', '=', projectId)
      .where('type', '!=', 'owner')
      .fetchAll()
      .then((assocs) => {
        return Promise.all(assocs.map(assoc => assoc.destroy()));
      });
  }

  static getMissingUsers(originalUsers, newUsers, association) {
    const usersToBeDeleted = differenceWith(
      originalUsers,
      newUsers,
      (u1, u2) => u2.id === u1.id,
    );
    // We map the users to their associations
    const assocIds = intersectionWith(
      association,
      usersToBeDeleted,
      // Filter out the owner : it shouldn't be changed
      (asso, u) => asso.userId === u.id && asso.type !== 'owner',
    );
    return assocIds.map(a => a.userId);
  }

  static getExtended(query, paginated) {
    const projects = new ProjectModel()
      .joinView(query.query)
      .query((qb) => {
        Object.keys(query.scopes).forEach((field) => {
          const value = query.scopes[field];
          qb.andWhere(snakeCase(field), '=', value);
        });
        qb.andWhere('project.deleted_at', 'IS', null);
      })
      .orderBy(query.orderBy ? snakeCase(query.orderBy) : 'created_at', query.ascending === '1' ? 'asc' : 'desc');
    if (paginated) {
      return projects.fetchPage({
        pageSize: query.limit || 25,
        page: query.page || 1,
        withRelated: ['owner', 'supervisor', 'members'],
      });
    }
    return projects.fetchAll({ withRelated: ['owner', 'supervisor', 'members'] });
  }
}

module.exports = Project;
