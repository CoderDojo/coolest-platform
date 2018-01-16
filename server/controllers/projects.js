const ProjectModel = require('../models/project');
const UserHandler = require('./users');
const UserModel = require('../models/user');
const { pick } = require('lodash');

class Project {
  static post(creator, project, eventId) {
    // TODO : apply endpoint validation
    // TODO : transaction
    const projectPayload = Object.assign(
      {},
      pick(project, ['name', 'category', 'description', 'org', 'orgRef']),
      { eventId },
    );
    const newProject = new ProjectModel(projectPayload);
    const promises = [];
    const users = [];
    // Save every user from the form
    project.users.forEach((user) => {
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
      const newUser = ((_userPayload) => {
        // We reassign the user_id if the user already exists (based on email)
        if (_userPayload.email) {
          return UserHandler.get({ email: _userPayload.email }).then((_retrievedUser) => {
            if (_retrievedUser !== null) _userPayload.id = _retrievedUser.id;
            return Promise.resolve(_userPayload);
          });
        }
        return Promise.resolve(_userPayload);
      })(userPayload)
        .then(_userPayload =>
          new UserModel(_userPayload)
            .save()
            .then((_user) => {
              users.push(Object.assign(_user.toJSON(), { type: user.type }));
              // We return the association to be saved in ProjectUsers
              return Promise.resolve({ user_id: _user.id, type: user.type });
            }));
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

  static getByEvent(eventId, query) {
    let queryBuilder = ProjectModel.where({ event_id: eventId });
    if (query.orderBy) {
      queryBuilder = queryBuilder.orderBy(query.orderBy, query.ascending === true || false);
    }
    return queryBuilder.fetchPage();
    // return queryBuilder.fetchPage({
    //   pageSize: query.limit || 25,
    //   page: query.page || 1,
    // });
  }
}

module.exports = Project;
