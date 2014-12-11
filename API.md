# WikiLab API

## Users

### POST /users

Create a new user

[Test](test/api/users/create-user.js)
[Code](routes/users.js)

### PATCH /users/{userId|'me'}

Update the current user's info

[Test](test/api/users/patch-user.js)
[Code](routes/users.js)

### PUT /users/{userId|'me'}/password

Update the current user's password

[Test](test/api/users/update-password.js)
[Code](routes/users.js)

## Teams

### POST /teams

Create a new team

[Test](test/api/teams/create-team.js)
[Code](routes/teams.js)

## Projects

### GET /projects

Get all projects which the current user has access to

[Test](test/api/projects/get-projects.js)
[Code](routes/projects.js)
