const handlers = require('../handlers/projects');
const passport = require('passport');
const acls = require('../authorisations/projects');

module.exports = (router, prefix) => {
  const base = `${prefix}/events/:eventId/projects`;
  acls.define(base);
  // curl curl -H 'Content-Type: application/json' -X POST --data-binary '{ "name": "MyPoneyProject",  "category": "HTML", "users": [{"firstName": "kid1", "lastName": "kido", "dob": "2008-12-01T20:00.000Z", "gender": "male", "type": "member"}, {"firstName": "orga", "lastName": "le", "dob": "1991-12-01T20:00.000Z", "gender": "male", "email": "a@a.com", "phone": "3538123123123", "country": "IE", "type": "supervisor" }]}' http://localhost:3000/api/v1/events/4583d8ab-f970-4c30-a343-e9ad4995ee4b/projects
  router.post(base, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.post);

  router.get(`${base}/:id`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.get);

  router.get(base, handlers.getAll);

  // curl -v -H 'Content-Type: application/json' -X PATCH --data-binary '{ "answers": { "social_project": true } }' http://localhost:8080/api/v1/events/8d9432fd-d6d0-4dde-b47c-07f1d465e5bb/projects/fb0972d8-7c6a-4325-b610-fcfde67d9fa4\?token\=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiYzZjNzE0NGMtNDZjZS00ODY3LTk1YmEtMGUxODNiYzUxYjFjIiwiaWF0IjoxNTE1NDMzNjUxLCJleHAiOjE1MTU0NjI0NTF9.I4swMLfWkbSb5EHoxPdbYop1ffFB6CMbezVFiufdg88
  router.patch(`${base}/:id`, passport.authenticate('jwt', { session: false }), acls.isAllowed, handlers.patch);
  router.param('id', handlers.param);
};
