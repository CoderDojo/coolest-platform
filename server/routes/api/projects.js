const projectHandler = require('../handlers/projects');
module.exports = (router, prefix) => {
  const base = `${prefix}/events/:eventId/projects`;

  // Verify a token is valid
  // curl curl -H 'Content-Type: application/json' -X POST --data-binary '{ "name": "MyPoneyProject",  "category": "HTML", "users": [{"firstName": "kid1", "lastName": "kido", "dob": "2008-12-01T20:00.000Z", "gender": "male", "type": "member"}, {"firstName": "orga", "lastName": "le", "dob": "1991-12-01T20:00.000Z", "gender": "male", "email": "a@a.com", "phone": "3538123123123", "country": "IE", "type": "supervisor" }]}' http://localhost:3000/api/v1/events/4583d8ab-f970-4c30-a343-e9ad4995ee4b/projects
  router.post(base, projectHandler.post)
}
