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
const sharp = require('sharp');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;

const teamConfig = {
  auth: { strategy: 'jwt', scope: 'team' },
  pre: [ { method: authUtil.bindTeamData, assign: 'team' } ]
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
      companyDbFunctions.getCompanies,
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
  method: 'GET',
  path: '/feedback',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      feedbackDbFunctions.getFeedback,
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
      const buf = Buffer.from(request.payload.image, 'base64');
      let resized;

      promises.push(
        // resize image to thumbnail size
        sharp(buf)
        .resize(512, 512)
        .png()
        .toBuffer()
        .then((file) => {
          resized = file.toString('base64');
          return documentDbFunctions.saveDocument({
            file
          })
        })

        .then((result) => {
          if(!result) {
            throw 'Unknown error while adding document. result was: ' + result;
          }

          const docId = result[0];

          // Attach document to team relation
          return teamDbFunctions.attachDocumentToTeam(docId, request.pre.team.id);
        })

        .then((result) => {
          if (!result) {
            throw 'Unknown error while attaching document to team. result was: ' + result;
          }

          return { file: 'data:image/png;base64,' + resized };
        })
      );
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
