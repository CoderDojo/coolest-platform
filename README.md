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
