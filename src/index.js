'use strict';

const Hapi = require('hapi');
const Path = require('path');
const Boom = require('boom');

const routes = require('./routes');
const config = require('./config');
var knex = require('./db').knexlocal;
const companyfunctions = require('./datasource/companyfunctions');
const teamfunctions = require('./datasource/teamfunctions');
const mapfunctions = require('./datasource/mapfunctions');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '..', 'public')
      }
    }
  }
});
server.connection({
  port: process.env.PORT || 3000,
  routes: {
    cors: true
  }
});

// Register authentication
server.register(require('hapi-auth-jwt2'), (err) => {
  if (err) {
    throw err;
  }

  if (process.env.NODE_ENV === 'production') {
    if (!config.secret || config.secret == 'really_secret_key') {
      console.error('ERROR! "SUPERADA_SECRET" environment variable must be set in production!');
      process.exit(1);
    }
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.secret,
    validateFunc: (decoded, request, callback) => {
      callback(null, true);
    },
    verifyOptions: { algorithms: ['HS256'] }
  });

  server.route(routes);
});

// Endpoint for rendered map
server.route({
  method: 'GET',
  path: '/public/map.png',
  handler: (request, reply) => {
    mapfunctions.getMap('rendered')
    .then((file) => (
      file ? reply(file) : reply(Boom.notFound())
    ));
  }
});

// Endpoint for map template
server.route({
  method: 'GET',
  path: '/public/map_template.png',
  handler: (request, reply) => {
    mapfunctions.getMap('template')
    .then((file) => (
      file ? reply(file) : reply(Boom.notFound())
    ));
  }
});

const companyLogoRegex = /^company(\d+)\.png$/;
const teamPictureRegex = /^team(\d+)\.png$/;

// Endpoint for files in DB
server.route({
  method: 'GET',
  path: '/public/{file}',
  handler: (request, reply) => {
    const fileName = request.params.file;

    const companyId = companyLogoRegex.exec(fileName);
    const teamId = teamPictureRegex.exec(fileName);

    if (companyId !== null) {
      companyfunctions.getCompanyLogo(companyId[1])
      .then((file) => (
        file ? reply(file) : reply(Boom.notFound())
      ));
    } else if (teamId !== null) {
      teamfunctions.getTeamLogo(teamId[1])
      .then((file) => (
        file ? reply(file) : reply(Boom.notFound())
      ));
    } else {
      reply(Boom.notFound());
    }
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
