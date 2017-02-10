'use strict';

var knex = require('../db').knexlocal;

const upsertItem = require('../utils/dbUtil').upsertItem;

exports.saveFeedback = (teamId, feedback) => (
  upsertItem('Feedback', 'teamId', {
    answers: JSON.stringify(feedback.answers),
    teamId
  })
  .then((results) => {
    return exports.getFeedbackAsTeam(teamId);
  })
);

exports.getFeedbackAsTeam = (teamId) => (
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

exports.getAllFeedback = () => {
  let questions;

  return knex('Question')
  .then((_questions) => {
    questions = _questions;
    return knex('Feedback').returning('*')
  })
  .then((allFeedback) => (
    allFeedback.map((feedback, i) => {
      feedback.answers = feedback.answers.map((answer, i) => ({
        answer: answer,
        questionText: questions[i].questionText,
      }))

      return feedback;
    })
  ))
};

exports.deleteFeedback = (feedbackId) => (
  knex('Feedback')
  .where({ feedbackId })
  .del()
  .then(exports.getAllFeedback)
);
