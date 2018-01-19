'use strict';

var config = require('./config').db;
var pg = require('pg');
pg.defaults.ssl = true;

exports.knexlocal = require('knex')(config);
