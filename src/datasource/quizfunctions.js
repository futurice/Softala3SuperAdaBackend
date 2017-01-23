'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;
var Boom = require('boom');

exports.getQuiz = (teamId) => {
  return knex("Quiz")
    .first()
    .where('teamId', teamId)
    .returning('*')
    .then((result) => {
      if (!result) {
        // Results not found in DB, quiz not done yet
        return {
          done: false,
          points: 0
        }
      } else {
        return {
          done: true,
          points: result.points
        }
      }
    });
};

exports.saveQuiz = (teamId, payload) => {
  return knex("Quiz")
    .insert({
      teamId,
      points: parseInt(payload.points)
    })
    .returning('*')
    .then((results) => {
      return {
        done: true,
        points: parseInt(payload.points)
      };
    })
    .catch((err) => {
      if (err.constraint === 'Quiz_pkey') {
        return Boom.forbidden('Quiz already done');
      }
      throw err;
    });
};

exports.deleteQuiz = (teamId, payload) => {
  return knex("Quiz")
    .where('teamId', teamId)
    .del()
    .then((results) => {
      return {
        done: false,
        points: 0
      };
    })
};
