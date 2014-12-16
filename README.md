wikilab-api
=============

WikiLab API

![Build Status](https://travis-ci.org/wikilab/wikilab-api.svg?branch=master)
[![Code Climate](https://codeclimate.com/github/wikilab/wikilab-api/badges/gpa.svg)](https://codeclimate.com/github/wikilab/wikilab-api)
[![Test Coverage](https://codeclimate.com/github/wikilab/wikilab-api/badges/coverage.svg)](https://codeclimate.com/github/wikilab/wikilab-api)
[![Dependency Status](https://david-dm.org/wikilab/wikilab-api.svg)](https://david-dm.org/wikilab/wikilab-api)

Install
-------

    npm install wikilab-api

HTTP API
-------

There are two methods available for authentication: HTTP Basic and session token. HTTP Basic authentication should only be used to request a new session token or when session token don't have enough permission to access(or update) the resource(i.e. changing user's password).

To auth a user using session token, add the custom header "X-SESSION-TOKEN" with the value of the token you have.

### Sessions

#### POST /sessions

Create a new session and get the token. You need to specify a ttl(measured in seconds).

[Test](test/api/sessions/create_session.js)
[Code](routes/sessions.js)

### Users

#### POST /users

Create a new user

[Test](test/api/users/create-user.js)
[Code](routes/users.js)

#### PATCH /users/{userId|'me'}

Update the current user's info

[Test](test/api/users/patch-user.js)
[Code](routes/users.js)

#### PUT /users/{userId|'me'}/password

Update the current user's password

[Test](test/api/users/update-password.js)
[Code](routes/users.js)

### Teams

#### POST /teams

Create a new team

[Test](test/api/teams/create-team.js)
[Code](routes/teams.js)

### Projects

#### GET /projects

Get all projects which the current user has access to

[Test](test/api/projects/get-projects.js)
[Code](routes/projects.js)

#### GET /projects/:projectId

Get the specified project info

[Test](test/api/projects/get-project.js)
[Code](routes/projects.js)
