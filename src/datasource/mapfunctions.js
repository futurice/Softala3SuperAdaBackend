'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

/*
// TODO!
exports.saveDocument = (mapName, image) => (
  knex('Map')
    .insert({ mapName, image })
    .then((results) => results[0])
)
*/

exports.getMap = (mapName) => (
  knex('Map')
    .first('file')
    .where({ mapName })
    .rightJoin('Document', 'Map.docId', 'Document.docId')
    .then((results) => results && results.file)
)
