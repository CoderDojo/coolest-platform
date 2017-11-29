const Project = require('../../models/project');
const User = require('../../models/user');
const { pick } = require('lodash');

// INSERT INTO event(id, name) VALUES(uuid_generate_v4(), 'CP-2018');
// curl -H 'Content-Type: application/json' -X POST --data-binary '{"email": "a"}' http://localhost:3000/api/v1/users
const post = (req, res, next) => {
  // TODO : apply endpoint validation
  const projectPayload = Object.assign(
    {},
    pick(req.body, ['name', 'category', 'dojoId']),
    { eventId: req.params.eventId },
  );
  const newProject = new Project(projectPayload);
  const promises = [];

  req.body.users.forEach((user) => {
    const userPayload = pick(user, ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'country']);
    const newUser = new User(userPayload).save()
      .then((_user) => {
        return Promise.resolve({ user_id: _user.id, type: user.type }); // We return the modified
      });
    promises.push(newUser);
  });
  return newProject.save()
    .then((_project) => {
      return Promise.all(promises)
        .then((associations) => {
          return new Project({ id: _project.id }).members().attach(associations);
        })
        .then(() => res.status(200).json(_project));
    });
};

module.exports = {
  post,
};
