'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions.js');
const companyDbFunctions = require('../datasource/companyfunctions.js');
const companypointDbFunctions = require('../datasource/companypointfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;

const companyConfig = {
  auth: { strategy: 'jwt', scope: 'company' },
  pre: [ { method: authUtil.bindUserData, assign: 'company' } ]
};

var routes = [];

routes.push({
  method: 'POST',
  path: '/company/authenticate',
  config: {
    validate: {
      payload: {
        name: Joi.string().required()
      },
      failAction: (request, reply, source, error) => {
        reply(Boom.unauthorized('Company not found.'));
      }
    }
  },
  handler: (request, reply) => {
    companyDbFunctions.getCompanyByName(request.payload.name)
    .then((company) => {
      if (!company) {
        return reply(Boom.unauthorized('Company not found.'));
      }

      const token = authUtil.createToken(
        company.companyId,
        request.payload.name,
        'company'
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
  path: '/company/teamlist',
  config: companyConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.getTeamsAsCompany,
      [request.query.filter, request.pre.company.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/company/companypoint/{teamId}',
  config: companyConfig,
  handler: (request, reply) => {
    replyWithResult(
      companypointDbFunctions.addCompanyPoint,
      [request.pre.company.id, request.params.teamId, request.payload.points],
      reply
    );
  }
});

routes.push({
  method: 'DELETE',
  path: '/company/companypoint/{teamId}',
  config: companyConfig,
  handler: (request, reply) => {
    replyWithResult(
      companypointDbFunctions.clearCompanyPoint,
      [request.pre.company.id, request.params.teamId],
      reply
    );
  }
});

module.exports = routes;
