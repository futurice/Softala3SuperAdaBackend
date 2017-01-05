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
  pre: [ { method: authUtil.bindTeamData, assign: 'company' } ]
};

var routes = [];

routes.push({
  method: 'POST',
  path: '/teamlist',
  config: {
    validate: {
      payload: {
        searchfilter: Joi.string().allow('')
      }
    },
    auth: {
      strategy: 'jwt',
      scope: 'company'
    },
    pre: [
      { method: authUtil.bindTeamData, assign: 'company' }
    ]
  },
  handler: function(request, reply){
    // TODO: promisify
    var companyId = request.pre.company.id;

    teamDbFunctions.getTeamList(request.payload.searchfilter, companyId, function(err, result) {

      result.forEach(function(item, index) {
        if(item != null && item.file != null) {
          item.file = item.file.toString('base64')
        }
      });

      reply({ err: err , result: result });
    });
  }
});


routes.push({
  method: 'POST',
  path: '/company/authenticate',
  config: {
    validate: {
      payload: {
        name: Joi.string().required()
      }
    }
  },
  handler: function(request, reply) {
    // TODO: promisify
    var success = false;
    var token = '';

    companyDbFunctions.getCompany(request.payload.name, function(err, result) {
      var success = false;
      var id = 0;
      if(result != null && result[0] != 'undefined') {
        success = result[0].companyId > 0;
        id = result[0].companyId;
      }

      if(success) {
        token = authUtil.createToken(id, request.payload.name, 'company');
      }
      reply({ success: success, token: token });
    }
    );
  }
});

routes.push({
  method: 'POST',
  path: '/companypoint',
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
      { method: authUtil.bindTeamData, assign: 'company' }
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
  path: '/clearpoints',
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
      { method: authUtil.bindTeamData, assign: 'company' }
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
