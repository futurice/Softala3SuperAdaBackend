'use strict';

var knex = require('../db').knexlocal;

exports.saveDocument = (file) => (
  knex('Document')
    .insert({ file })
    .returning('docId')
    .then((results) => results[0])
)

exports.getDocument = (docId) => (
  knex('Document')
    .first('docId')
    .where({ docId })
)
