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

const adminConfig = {
  auth: { strategy: 'jwt', scope: 'admin' },
  pre: [ { method: authUtil.bindTeamData, assign: 'admin' } ]
};

var routes = [];

routes.push({
  method: 'POST',
  path: '/teams',
  config: {
    auth: {
      strategy: 'jwt',
      scope: 'admin'
    },
    validate: {
      payload: {
        name: Joi.string().required(),
        description: Joi.string(),
        documentId: Joi.number()
      }
    },
    pre: [
      { method: authUtil.bindTeamData, assign: 'admin' }
    ]
  },

  handler: function(request, reply) {
    // TODO: promisify
    var team = {
      teamName: request.payload.name,
      description: request.payload.description,
      active: 1,
      docId: request.payload.documentId
    }

    teamDbFunctions.addTeam(team, function(err, result) {
      var success = false;
      var message = '';

      if(result != null && result[0] != null) {
        success = result[0] > 0;
      }

      if(!success) {
        message = 'Adding team failed. Possibly due to dublicate name';
      }

      reply({ success: success, message: message });
    }
    );
  }
});

routes.push({
  method: 'POST',
  path: '/admins/authenticate',
  config: {
    validate: {
      payload: {
        admin: Joi.string().required(),
        password: Joi.string().required()
      }
    }
  },
  handler: function(request, reply) {
    // TODO: promisify
    adminDbFunctions.findAdmin(request.payload.admin, request.payload.password, function(success) {
      var token = '';

      if(success) {
        token = authUtil.createToken(1, request.payload.admin, 'admin');
      }

      reply({ success: success, token:token });
    })
  }
});

module.exports = routes;
