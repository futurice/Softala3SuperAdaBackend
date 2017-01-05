const Boom = require('boom');

// helper function which takes a promise returning handler function, arguments
// to call it with, and passes the result to reply
exports.replyWithResult = (handler, args, reply) => {
  handler.apply(this, args)
    .then(reply)
    .catch((err) => {
      reply(Boom.badImplementation(err));
    });
};
