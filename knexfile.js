//This file is interpreted as ES5 CommonJS module.
'use strict';

// By default we use a single configuration for all
// environments, and customize the database connection
// using environment variables. Feel free to create a
// custom config for any environment, if you prefer.
const ALL_ENVIRONMENTS = Object.freeze({
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host : '127.0.0.1',
    user : 'postgres', /* whoami */
    password : '',
    database : 'superada'
   },
  // Use a single connection to execute migrations.
  pool: {
    min: 1,
    max: 1
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: 'db/migrations'
  },
});

// Feel free to create any number of other environments.
// The ones below are a best attempt at sensible defaults.
module.exports = {
  // Developer's local machine
  development: Object.assign({}, ALL_ENVIRONMENTS, {
    seeds: {
      directory: 'db/seeds-dev',
    },
  }),
  // Production environment
  production: Object.assign({}, ALL_ENVIRONMENTS, {
    seeds: {
      directory: 'db/seeds-prod',
    },
  })
};
