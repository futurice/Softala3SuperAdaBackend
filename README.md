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

## Run backend
```
npm start
```

Backend is now listening on port 3000 (or `$PORT` if set)
