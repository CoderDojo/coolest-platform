const ProjectModel = require('../../models/project');
const UserHandler = require('./users');
const UserModel = require('../../models/user');
const { pick } = require('lodash');

class Project {
  static post(req, res, next) {
    // TODO : apply endpoint validation
    const projectPayload = Object.assign(
      {},
      pick(req.body, ['name', 'category', 'dojoId']),
      { eventId: req.params.eventId },
    );
    const newProject = new ProjectModel(projectPayload);
    const promises = [];

    req.body.users.forEach((user) => {
      const userPayload = pick(user, ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'country']);
      const newUser = ((_userPayload) => {
        if (_userPayload.email) {
          return UserHandler.get({ email: _userPayload.email })
            .then((_retrievedUser) => {
              if (_retrievedUser !== null) _userPayload.id = _retrievedUser.id;
              return Promise.resolve(_userPayload);
            });
        }
        return Promise.resolve(_userPayload);
      })(userPayload)
        .then((_userPayload) => {
          return new UserModel(_userPayload)
            .save()
            .then((_user) => {
              // We return the association
              return Promise.resolve({ user_id: _user.id, type: user.type });
            });
        });
      promises.push(newUser);
    });
    return newProject.save()
      .then((_project) => {
        return Promise.all(promises)
          .then((associations) => {
            return new ProjectModel({ id: _project.id }).members().attach(associations);
          })
          .then(() => res.status(200).json(_project));
      })
      .catch(() => next(new Error('Error while saving your project.')));
  }
}


module.exports = Project;
