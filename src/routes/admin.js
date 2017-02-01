'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions.js');
const adminDbFunctions = require('../datasource/adminfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const sharp = require('sharp');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;

const adminConfig = {
  auth: { strategy: 'jwt', scope: 'admin' },
  pre: [ { method: authUtil.bindTeamData, assign: 'admin' } ]
};

var routes = [];

routes.push({
  method: 'GET',
  path: '/teams',
  config: adminConfig,
  handler: function(request, reply) {
    replyWithResult(
      teamDbFunctions.getAllTeams,
      [],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/teams',
  config: adminConfig,
  handler: function(request, reply) {
    replyWithResult(
      teamDbFunctions.createTeam,
      [request.payload.teamName],
      reply
    );
  }
});

routes.push({
  method: 'DELETE',
  path: '/teams/{teamId}',
  config: adminConfig,
  handler: function(request, reply) {
    replyWithResult(
      teamDbFunctions.deleteTeam,
      [request.params.teamId],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/admins/authenticate',
  config: {
    validate: {
      payload: {
        email: Joi.string().required(),
        password: Joi.string().required()
      },
      failAction: (request, reply, source, error) => {
        reply(Boom.unauthorized('Incorrect email or password!'));
      }
    },
    pre: [
      { method: authUtil.verifyCredentials('Admin'), assign: 'admin' }
    ]
  },
  handler: (request, reply) => {
    const token = authUtil.createToken(
      undefined,
      request.pre.admin.email,
      'admin'
    );

    reply( token );
  }
});

module.exports = routes;
