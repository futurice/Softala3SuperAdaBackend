'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

const upsertItem = require('../utils/dbUtil').upsertItem;

exports.saveFeedback = (teamId, feedback) => (
  upsertItem('Feedback', 'teamId', {
    answers: JSON.stringify(feedback.answers),
    teamId
  })
  .then((results) => {
    return exports.getFeedback(teamId);
  })
);

exports.getFeedback = (teamId) => (
  knex('Question')
  .then((questions) => {
    return knex('Feedback')
    .first()
    .where('teamId', teamId)
    .returning('*')
    .then((feedback) => {
      if (!feedback) {
        return questions;
      }

      return questions.map((question, i) => {
        question.answer = feedback.answers[i];
        return question;
      });
    });
  })
);
