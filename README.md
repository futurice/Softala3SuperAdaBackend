# SuperAda-Backend

Backend for SuperAda project

# Setup guide

## Install project dependencies
```
npm i
```

## Install PostgreSQL

Look up instructions for your specific OS/distribution.

## Initialize DB
```
$ psql --user postgres
  CREATE DATABASE superada;
  <C-d>

npm run db:migrate
```

## Insert seed data
```
# Run either of these

# Production environment: inserts initial event companies, map, feedback
# questions
npm run db:seed

# Development environment: additionally inserts sample teams, points, quiz
# results, and an admin account with credentials: foo@bar.com:foobar
npm run db:seed-dev
```

## Register admin user (production environments)
```
# Get URL from e.g. Heroku dashboard
$ DATABASE_URL=postgres://user:pass@hostname/dbname node register_admin.js
```

## Set secret used for generating JWT tokens (production environments)
```
# Backend will refuse to run if NODE_ENV=production and this is not set:
$ export SUPERADA_SECRET=[secret-string]
```

In Heroku, you can:
```
heroku config:set SUPERADA_SECRET=[secret-string]
```

Recommendation for generating `[secret-string]`:
```
$ node
> require('crypto').randomBytes(32).toString('hex')
'790f9dd8653ba650cc7925a8d89e16eff533e8549dd65d071ddf6ea80ce1ab0a'
```

## Run backend
```
npm start
```

Backend is now listening on port 3000 (or `$PORT` if set)
