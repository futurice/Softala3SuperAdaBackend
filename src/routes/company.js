'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions.js');
const companyDbFunctions = require('../datasource/companyfunctions.js');
const companypointDbFunctions = require('../datasource/companypointfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const sharp = require('sharp');
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
    companyDbFunctions.getCompany(request.payload.name)
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
      teamDbFunctions.getTeamList,
      [request.query.filter, request.pre.company.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/company/companypoint',
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'company'
    },
    validate: {
      payload: {
        teamId: Joi.number().required(),
        point: Joi.number().required()
      }
    },
    pre: [
      { method: authUtil.bindUserData, assign: 'company' }
    ]
  },

  handler: function(request, reply) {
    // TODO: promisify
    var companypoint = {
      teamId: request.payload.teamId,
      companyId: request.pre.company.id,
      point: request.payload.point
    }

    companypointDbFunctions.addCompanyPoint(companypoint, function(err, result) {
      var success = false;
      var message = '';

      if(result != null) {
        success = result > 0;
      }

      if(!success) {
        message = 'Adding points failed';
      }

      reply({ success: success, message: message });
    });
  }
});

routes.push({
  method: 'POST',
  path: '/company/clearpoints',
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'company'
    },
    validate: {
      payload: {
        teamId: Joi.number().required()
      }
    },
    pre: [
      { method: authUtil.bindUserData, assign: 'company' }
    ]
  },
  handler: function(request, reply) {
    // TODO: promisify
    var clearPoints = {
      companyId: request.pre.company.id,
      teamId: request.payload.teamId
    }

    companypointDbFunctions.clearCompanyPoint(clearPoints, function(err, result) {
      var success = false;
      var message = '';
      if(result != null) {
        success = result > 0;
      }

      if(!success) {
        message = 'Clearing points failed';
      }

      reply({ success: success, message: message });
    }
    );
  }
});

module.exports = routes;
