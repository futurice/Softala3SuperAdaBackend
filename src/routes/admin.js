'use strict';

const authUtil = require('../utils/authUtil');
const teamDbFunctions = require('../datasource/teamfunctions.js');
const companyDbFunctions = require('../datasource/companyfunctions.js');
const Joi = require('joi');
const Boom = require('boom');
const sharp = require('sharp');
const _ = require('lodash');
const replyWithResult = require('../utils/restUtil').replyWithResult;
const Jimp = require('jimp');
const path = require('path');

const adminConfig = {
  auth: { strategy: 'jwt', scope: 'admin' },
  pre: [ { method: authUtil.bindUserData, assign: 'admin' } ]
};

let circle = null;

Jimp.read(path.join(__dirname, '..', '..', 'public', 'circle.png'))
.then((image) => { circle = image });

var routes = [];

// Admin team endpoints
routes.push({
  method: 'GET',
  path: '/admin/teams',
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
  path: '/admin/teams',
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
  path: '/admin/teams/{teamId}',
  config: adminConfig,
  handler: function(request, reply) {
    replyWithResult(
      teamDbFunctions.deleteTeam,
      [request.params.teamId],
      reply
    );
  }
});

// Admin company endpoints
routes.push({
  method: 'GET',
  path: '/admin/companies',
  config: adminConfig,
  handler: function(request, reply) {
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
  handler: function(request, reply) {
    let companyId = null;
    companyDbFunctions.createCompany(request.payload.companyName)
    .then((results) => {
      const logo = request.payload.logo;

      // parse the base64 encoded logo and save to file
      const matches = logo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const file = {};

      if (matches.length !== 3) {
        throw new Error('Invalid input string');
      }

      file.type = matches[1];
      file.data = new Buffer(matches[2], 'base64');

      companyId = results[0].companyId;
      return Jimp.read(file.data);
    })
    .then((image) => (
      image
        .resize(180, 180)
        .mask(circle, 0, 0)
        .write(path.join(__dirname, '..', '..', 'public', 'company' + companyId + '.png'))
    ))
    .then(companyDbFunctions.getCompanies)
    .then((result) => {
      reply(result);
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
    })
  }
});

routes.push({
  method: 'DELETE',
  path: '/admin/companies/{companyId}',
  config: adminConfig,
  handler: function(request, reply) {
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
