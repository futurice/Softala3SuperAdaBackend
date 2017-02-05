'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

exports.saveDocument = (doc) => (
  knex('Document')
    .insert(doc)
    .returning('docId')
)
