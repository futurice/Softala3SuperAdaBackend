'use strict';

var pg = require('pg');
pg.defaults.ssl = true;

exports.knexlocal = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host : '127.0.0.1',
    user : 'postgres', /* whoami */
    password : '',
    database : 'superada',
    ssl: false
  }
});
