'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions');
const quizDbFunctions = require('../datasource/quizfunctions');
const companyDbFunctions = require('../datasource/companyfunctions');
const companypointDbFunctions = require('../datasource/companypointfunctions');
const documentDbFunctions = require('../datasource/documentfunctions');
const feedbackDbFunctions = require('../datasource/feedbackfunctions');

const Joi = require('joi');
const Boom = require('boom');
const Jimp = require('jimp');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;

const teamConfig = {
  auth: { strategy: 'jwt', scope: 'team' },
  pre: [ { method: authUtil.bindUserData, assign: 'team' } ]
};

var routes = [];

routes.push({
  method: 'POST',
  path: '/teams/authenticate',
  config: {
    validate: {
      payload: {
        name: Joi.string().required()
      },
      failAction: (request, reply, source, error) => {
        reply(Boom.unauthorized('Team not found.'));
      }
    }
  },
  handler: (request, reply) => {
    teamDbFunctions.getTeam(request.payload.name)
    .then((team) => {
      if (!team) {
        return reply(Boom.unauthorized('Team not found.'));
      }

      const token = authUtil.createToken(
        team.teamId,
        request.payload.name,
        'team'
      );

      reply( token );
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
    });
  }
});

routes.push({
  method: 'GET',
  path: '/companies',
  config: teamConfig,
  handler: function(request, reply) {
    replyWithResult(
      companyDbFunctions.getCompaniesAsTeam,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'GET',
  path: '/teamdetails',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.getDetails,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'GET',
  path: '/quiz',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      quizDbFunctions.getQuiz,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/quiz',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      quizDbFunctions.saveQuiz,
      [request.pre.team.id, request.payload],
      reply
    );
  }
});

routes.push({
  method: 'DELETE',
  path: '/quiz',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      quizDbFunctions.deleteQuiz,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'GET',
  path: '/feedback',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      feedbackDbFunctions.getFeedbackAsTeam,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/feedback',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      feedbackDbFunctions.saveFeedback,
      [request.pre.team.id, request.payload],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/teamdetails',
  config: Object.assign({}, teamConfig, {
    payload: {
      parse: true,
      maxBytes: 1024 * 1024 * 20 // 20 MB ought to be enough for anybody
    }
  }),
  handler: (request, reply) => {
    let promises = [];

    if (request.payload.description) {
      promises.push(teamDbFunctions.updateTeamDescription(request.pre.team.id, request.payload.description));
    }
    if (request.payload.image) {
      promises.push(teamDbFunctions.updateTeamImage(request.pre.team.id, request.payload.image));
    }

    Promise.all(promises)
    .then((result) => {
      result = _.reduce(result, _.extend)
      reply(result);
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
    });
  }
});

module.exports = routes;
