# Event Admin

Once the site is up and running and you have the appropriate subdomain you can log into the admin section by visiting `https://**subdomain**.coolestprojects.org/admin/`
The credentials for each events admin accounts are stored in lastpass

You'll be redirected to the event page `https://**subdomain**.coolestprojects.org/admin/events/**event_slug**` and will see a list of registered projects

## Adding admin users

To add admin users append `/users` to the end of the event url i.e. `https://**subdomain**.coolestprojects.org/admin/events/**event_slug**/users` and you will see a basic form.
Add the email address and a password (generate one using [DuckDuckGo](https://duckduckgo.com/?q=random+passphrase&atb=v147-1&ia=answer) or lastpass)
Click `Submit Query` and the account will be created.
The credentials will be emailed to the user. The password is in the email but you may want to create a note in lastpass to store created credentials.

## Google sheets user

To get data out of the system and into google sheets/data studio we need to create a user to make api calls, this needs to be done for each event (UK, USA and International)

Using [Adding admin users](## Adding admin users) process create a user, we won't need to log in with this user so the email doesn't need to be valid.
Something like `google@example.com` will be fine.

The site authenticates users by checking their auth token is no older than 8 hours. We don't want to have to keep logging in to keep the sheet working so we need to create an auth token for the user that won't expire.

The auth tokens are JSON Web Tokens [(JWT)](https://jwt.io/introduction/) and are created using the [jsonwebtoken package](https://github.com/auth0/node-jsonwebtoken)

To create a token that won't expire we need to create one with an `issued at` in the future.
You could do this via an [online node repl](https://repl.it/languages/Nodejs)

Add the `jsonwebtoken` package from the menu on the left

In the editor add the code:

```
  const jwt = require('jsonwebtoken');

  const tkn = jwt.sign({ data: "**userId**", iat: **unix timestamp** }, "**secret**")
  console.log(tkn)
```

Get the userId from the database for the user you created.
Generate a unix timestamp for some date in the future (allow plenty of time for the event). You can do this easily [here](https://coderstoolbox.net/unixtimestamp/)
The secret for signing the token needs to match the one used for the site. This is different for each event, check the kubernetes secrets to get the value you need.

Overwrite the users auth token value in the database with the token you just generated.

## Google sheet setup

In the `Digital Team > Clubs, Youth and Events > Coolest Projects` folder on Google Drive there is an Example Coolest projects CSV Import sheet.
Make a copy of this sheet for each event.

On the `Projects` tab there is an importData statement in cell `A1`

Amend the url to use the correct subdomain, event ID, and set the token value in the query string to the generated one for your user.
Once these are set correctly you should see the sheet populate with projects from the site.

Then repeat this on the `Members` tab.

**Once this has been done you can't log in as the user or a new token will be generated and you will have to repeat the whole process.**

With the sheet setup the google data studio can be created which pulls from the sheet.
