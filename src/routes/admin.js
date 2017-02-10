'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions.js');
const companyDbFunctions = require('../datasource/companyfunctions.js');
const feedbackDbFunctions = require('../datasource/feedbackfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;
const path = require('path');

const adminConfig = {
  auth: { strategy: 'jwt', scope: 'admin' },
  pre: [ { method: authUtil.bindUserData, assign: 'admin' } ]
};

var routes = [];

// Admin team endpoints
routes.push({
  method: 'GET',
  path: '/admin/teams',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.getAllTeams,
      [],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/admin/teams',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.createTeam,
      [request.payload.teamName],
      reply
    );
  }
});

routes.push({
  method: 'DELETE',
  path: '/admin/teams/{teamId}',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.deleteTeam,
      [request.params.teamId],
      reply
    );
  }
});

routes.push({
  method: 'GET',
  path: '/admin/feedback',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      feedbackDbFunctions.getAllFeedback,
      [],
      reply
    );
  }
});

routes.push({
  method: 'DELETE',
  path: '/admin/feedback/{feedbackId}',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      feedbackDbFunctions.deleteFeedback,
      [request.params.feedbackId],
      reply
    );
  }
});

// Admin company endpoints
routes.push({
  method: 'GET',
  path: '/admin/companies',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      companyDbFunctions.getCompanies,
      [],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/admin/companies',
  config: adminConfig,
  handler: (request, reply) => (
    replyWithResult(
      companyDbFunctions.createCompany,
      [request.payload.companyName, request.payload.logo],
      reply
    )
  )
});

/*
    let companyId = null;
    companyDbFunctions.createCompany(request.payload.companyName)
    .then(companyDbFunctions.getCompanies)
    .then((result) => {
      reply(result);
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
    })
  }
});
*/

routes.push({
  method: 'DELETE',
  path: '/admin/companies/{companyId}',
  config: adminConfig,
  handler: (request, reply) => {
    replyWithResult(
      companyDbFunctions.deleteCompany,
      [request.params.companyId],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/admin/authenticate',
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
