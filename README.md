# coolest-platform

The Coolest Platform for the coolest of events, Coolest Projects

## Setup

To setup the dev environment run `docker-compose run --rm platform yarn`

### Migrations

Migrations are running automatically. In case you want to rerun a migration, knex provides a cli that you can use :

`node ./node_modules/knex/bin/cli.js --knexfile ./server/config/db.json --cwd ./server/database migrate:latest`

Seeding is done on startup if NODE_ENV == development after running the migrations. It'll wipe the database starting from the "event" table.
You can run a seeding manually via:

`node ./node_modules/knex/bin/cli.js --knexfile ./server/config/db.json --cwd ./server/database seed:run`

## Run

### Full stack

To start the sever run `docker-compose up platform`

### Vue app only

To start the vue dev server with a mock API run `yarn start-with-mocks`

### Defaults accounts

Admin: hello@coolestprojects.org:banana
Owners: testowner[1..110]@example.com:request an email && get the token from the db

## Test

The tests are run in the `test` container
which includes the necessary browsers.

```
docker-compose up test
```

Server side integration tests requires a db. To run any test separately: 
```
docker-compose run --rm yarn server-int
```
## Production setup
### Connect to the psql
```

psql -h $PG_COOL_HOST -U $PG_COOL_USER $PG_COOL_DATABASE

```

### Create the event
```

INSERT INTO event(id, name, slug, location, categories, date, registration_start, registration_end, homepage, contact, questions, freeze_date, tz, external_ticketing_uri, requires_approval, seating_prepared, last_confirmation_email_date) VALUES(uuid_generate_v4(), 'Coolest Projects International 2019', 'cp-2019', 'RDS Main Hall, Dublin, Ireland', '{"VIS":"Visual programming", "WEB":"Web", "MOB":"Mobile apps", "HW": "Hardware", "3D": "3D design and animation", "ADV": "Advanced programming" }', null, null, '2018-04-14T12:00:00Z','www.coolestprojects.org/international','hello@coolestprojects.org','["social_project", "educational_project", "innovator_stage"]','2018-05-19T00:00:00Z','Europe/Dublin', null, false, false, null);

```
