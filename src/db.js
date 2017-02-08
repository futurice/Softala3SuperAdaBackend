'use strict';

exports.knexlocal = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host : '127.0.0.1',
    user : 'postgres', /* whoami */
    password : '',
    database : 'superada'
  }
});
