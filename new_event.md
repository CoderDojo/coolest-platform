# Setting Up Coolest Platform Events

## Prerequisites

- Kubernetes CLI (instructions below)
- A local clone of [k8s config](https://github.com/CoderDojo/k8s-config/)
- Access to the CoderDojo foundation AWS Management Console

## Kubernetes CLI

You will need the kubernetes cli to deploy each site.

Install v 1.8.5 via brew as per [gist](https://gist.github.com/rdump/b79a63084b47f99a41514432132bd408)

Create a config file `~/.kube/config` and add the contents from the `CD Kubernetes (k8s)` note in the `Shared-Digital` folder on lastpass.

---

## Database

If it doesn't already exist we need to create the database in RDS in AWS console.

## Get Database Details

In k8s config there is a separate folder for each event.
Go into the relevant folder for the site you are setting up e.g. `coolest-namespace` for the international event and there will be 4/5 folders:

- deployments
- horizontalpodautoscalers
- secrets
- services

(There may be a jobs folder but don't worry about that)

Open the `secrets/coolest-secret.yaml` file and copy the base64 encoded value for `db.json`

Decode this by running: `echo '**encoded value**' | base64 -D` in a terminal

(If you are running on linux or using Gnu tools the decode flag will be `-d` instead of `-D`)

This should output the json which provides all the database configuration.
It will look something like:

```
{
  "client": "postgres",
  "connection": {
    "host": "something-something.rds.amazonaws.com",
    "user": "coolest_username",
    "password": "supersecurepasswordvalue",
    "database": "coolest_databasename"
  }
}
```

Copy the json and put it into a new file in a text editor.

You will need the values for the user, password and database to create the new database.
Once the new database is created you will then need to update the host value in the json and update `secrets/coolest-secret.yaml` with the new base64 encoded json.

### Create The Database

From AWS Management Console, go to RDS and click `Create database`

Unless otherwise mentioned leave default values.

- `Standard Create`
- PostgreSQL

#### Settings

**DB Instance Identifier**
Should be in the format `coolest-database-{event-suffix}-{year}` e.g: `coolest-database-uk-2020`

**Credential settings**
Set master username and password to match those in the decoded json from the secrets file.

#### DB Instance Size

- Burstable classes:
- db.t2.medium

#### Storage

**Storage type**
General Purpose (SSD)

#### Availability & durability

- Do not create a standby instance

#### Connectivity

**Virtual Private Cloud**
Select `DBs` VPC

##### Additional connectivity configuration

**VPC Security Group**
Add to `prod-zen-database` security group, and remove default

#### Additional Config

**Initial database name**
Set to match `databases` value from decoded db.json

Click create database.

---

## Create namespace

While the database is coming up we can create the kubernetes namespace if it isn't already there:

`kubectl create namespace **name**`

Where name is going to be `coolest-namespace`, `coolest-namespace-usa` or `coolest-namespace-uk` depending on which site you are working on.

---

## Update kubernetes config

Once the database is created alter the db.json from earlier and set the `host` to match the endpoint of the new database.

Copy the json and in terminal encode it to base64:

```
echo -n 'paste the json here' | base64
```

(The -n flag will ensure there is no newline at the end of the encoded string)

In the `secrets/coolest-secret.yaml` of the k8s-config project:

- Change the value of `db.json` to the encoded string you have just generated.
- Update the `postgres_host` to be a base64 encoded string of the newly generated database endpoint (encode it the same way as the json)

In `deployments/coolest-platform.yaml` update HOSTNAME to the correct value for the new event.

Apply secrets and then apply all (run these commands from the correct namespace folder using the correct namespace flag).

You can run these commands with the `--dry-run` flag appended first to check everything is valid.

```
kubectl apply -f secrets/coolest-secret.yaml --namespace=coolest-namespace

kubectl apply -f . -R --namespace=coolest-namespace
```

## Check Deployment

Run `kubectl proxy` in a terminal and then open [Kubernetes](http://127.0.0.1:8001/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy) in your browser.

Select your namespace from the dropdown on the left and check that the deployment is OK and two pods have successfully been created.

## Setup load balancer

Browse to AWS Management Console > EC2 > Load Balancers and find the new load balancer.

It won't have a useful name so click on a load balancer and select the `Tags` tab which will show you the service name.

Once you have found it you need the DNS name from the `Description` tab

Log in to Cloudflare using the credentials for the `cpwebteam@coderdojo.com` account in lastpass.

Go to `coolestprojects.org` and then `DNS`

Add a record to create the CNAME for the new site:

- Type: CNAME
- Name: The subdomain for the new event e.g. `register-uk-2020`
- IPv4 Address: The DNS name of the load balancer
- Proxy Status: DNS Only (Leave TTL as Auto)

---

## Create Event in Database

To create the event you will need all the information around dates and times, venue, categories etc.

### Prepare Database

Open the kubernetes psql shell:

`kubectl exec -it psql-shell /bin/bash`

Connect to your newly created database using the details in the db.json to create a connection string:

`psql 'postgresql://username:password@hostname/database-name'`

Add the `uuid-ossp` extension to database to allow UUIDs to be generated:

`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Create Event

While connected to the psql shell create an empty event using the following script:

```
INSERT INTO event (id) VALUES (Uuid_generate_v4());
```

Get the ID of the newly created event `select id from event;` (there should only be one event in the database)

Then update the event information to the correct values:

(See notes below about formatting the data)

```
UPDATE event
SET    name = '',
       slug = '',
       location = '',
       date = '',
       registration_start = '',
       registration_end = '',
       categories = '',
       homepage = '',
       contact = '',
       questions = '',
       freeze_date = '',
       tz = '',
       external_ticketing_uri = ''
WHERE  id = '**id of new event**';
```

##### Formatting Data Input

**Slug** will be in the format `'{event}-{year}'` where event is `int`, `uk` or `us` e.g. `int-2020`

It's probably easiest to input dates in the ISO format and UTC `'2020-12-25T09:30:00Z'`

Remember to allow for daylight savings as necessary.

**Categories** is stored as json with a category code as the key, and the name as the value e.g.

```
'{"HW": "Hardware", "GAM": "Games"}'
```

**Questions** is an array of string keys the front end uses to show the correct question to the users. The keys and their related questions are in [client/src/project/CustomQuestions.js](https://github.com/CoderDojo/coolest-platform/blob/master/client/src/project/CustomQuestions.js) e.g.

```
'["travel_bursary", "attendance_prev_year"]'
```

**freeze_date** refers to the last date people can edit their projects

**tz** is the timezone, the frontend displays this so it needs to be correct. For UK it will be `'Europe/London'`, for the international event in Dublin it will be `'Europe/Dublin'`. The timezone for the US event will need to be provided or found.

---

Once the event is populated with the correct information you should be able to navigate to the new site with the event slug, and register a project.

---

## Update Event Slug

In [.circleci/kube.sh](.com/CoderDojo/coolest-platform/blob/master/.circleci/kube.sh), update the `EVENT_SLUG` build arg for each `docker build` command.
This should match the slug set in the database for each of the international, UK and USA events.
Once merged to master and deployed (automatically via CircleCI), this will result in the registration app redirecting to this slug and loading the correct event.
