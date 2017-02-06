'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

exports.saveDocument = (mapName, image) => (
  knex('Map')
    .insert({ mapName, image })
    .then((results) => results[0])
)

exports.getMap = (mapName) => (
  knex('Map')
    .first('image')
    .where({ mapName })
)
