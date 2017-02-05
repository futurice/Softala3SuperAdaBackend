
const bcrypt = require('bcrypt');
var knex = require('../db').knexlocal;
const Boom = require('boom');
const secret = require('../config').secret;
var jwt = require('jsonwebtoken');

const saltRounds = 10;
const bearerRegex = /Bearer\s+(.*)/i;

/*
exports.hashPassword = function(password) { // TODO can't create admin accounts
  // Generate a salt at level 10 strength
  const promise = new Promise(
    function(resolve, reject) {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          reject(err);
        }
        bcrypt.hash(password, salt, (error, hash) => {
          if (error) {
            reject(error);
          } else {
            resolve(hash);
          }
        });
      });
    }
  );
  return promise;
}
*/

let jwtExpirationHours = 24;

// Crate a json web token for user id and name
exports.createToken = (id, name, scope) => ({
  // Sign the JWT
  token: jwt.sign({
    id,
    name,
    scope
  }, secret, {
    algorithm: 'HS256',
    expiresIn: jwtExpirationHours + 'h'
  }),
  expiresIn: jwtExpirationHours * 60 * 60 * 1000 // in milliseconds
})

// Verify authentication request credentials
exports.verifyCredentials = (tableName) => ({ payload: { email, password }}, res) => (
  knex(tableName)
    .first()
    .where('email', email)
    .then((user) => {
      if (!user) {
        return res(Boom.unauthorized('Incorrect email or password!'));
      }

      bcrypt.compare(password, user.password, (err, isValid) => {
        if (isValid) {
          res(user);
        } else {
          res(Boom.unauthorized('Incorrect email or password!'));
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res(Boom.unauthorized('Incorrect email or password!'));
    })
);

// Get data from jwt
exports.bindUserData = (req, res) => {
  let bearerToken = req.headers.authorization;

  // strip "Bearer" word from header if present
  if (bearerToken.match(bearerRegex)) {
    bearerToken = bearerToken.match(bearerRegex)[1];
  }
  const decoded = jwt.verify(bearerToken, secret, {
    ignoreExpiration: true
  });

  res(decoded);
}
