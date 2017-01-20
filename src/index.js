'use strict';

const Hapi = require('hapi');
const Path = require('path');

const routes = require('./routes');
const config = require('./config');
var knex = require('./db').knexlocal;

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

server.register(require('inert'), (err) => {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/map.png',
    handler: (request, reply) => {
      reply.file('map.png');
    }
  });
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
