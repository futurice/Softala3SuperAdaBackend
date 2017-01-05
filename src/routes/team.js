'use strict';

var authUtil = require('../utils/authUtil');
var teamDbFunctions = require('../datasource/teamfunctions.js');
var companyDbFunctions = require('../datasource/companyfunctions.js');
var companypointDbFunctions = require('../datasource/companypointfunctions.js');
var adminDbFunctions = require('../datasource/adminfunctions.js');
var documentDbFunctions = require('../datasource/documentfunctions.js');
var feedbackDbFunctions = require('../datasource/feedbackfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const sharp = require('sharp');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;

var routes = [];

const teamConfig = {
  auth: { strategy: 'jwt', scope: 'team' },
  pre: [ { method: authUtil.bindTeamData, assign: 'team' } ]
};

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
            file,
            doctype: 1
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

routes.push({
  method: 'GET',
  path: '/companypoints',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      companypointDbFunctions.getCompanyPoints,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/feedback',
  config: Object.assign({}, teamConfig, {
    validate: {
      payload: {
        schoolGrade: Joi.number(),
        answer1: Joi.string().allow(''),
        answer2: Joi.string().allow(''),
        answer3: Joi.string().allow(''),
        answer4: Joi.string().allow(''),
        answer5: Joi.string().allow('')
      }
    }
  }),
  handler: function(request, reply) {
    // TODO: promisify
    var feedback = {
      schoolGrade: request.payload.schoolGrade,
      answer1: request.payload.answer1,
      answer2: request.payload.answer2,
      answer3: request.payload.answer3,
      answer4: request.payload.answer4,
      answer5: request.payload.answer5
    }

    feedbackDbFunctions.saveFeedback(feedback, function(err, result) {
      var success = false;
      var message = '';

      if(result != null && result[0] != null) {
        success = result[0] > 0;
      }

      if(!success) {
        message = 'Adding feedback failed';
      }

      reply({ success: success, message: message });
    });
  }
});

module.exports = routes;
