
const bcrypt = require('bcrypt');
var knex = require('../db').knexlocal;
const Boom = require('boom');
const secret = require('../config').secret;
var jwt = require('jsonwebtoken');

const saltRounds = 10;

exports.checkIfTeamNameAvailable = function(req, res) {
  return true; // TODO
}

exports.hashPassword = function(password) { // TODO
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

let jwtExpirationHours = 24;
// Crate a json web token for user id and name
exports.createToken = function(id, name, scope) {
  // Sign the JWT
  return {
    token: jwt.sign({id: id, name: name, scope: scope}, secret, {algorithm: 'HS256', expiresIn: jwtExpirationHours + 'h'}),
    expiresIn: jwtExpirationHours * 60 * 60 * 1000 // in milliseconds
  };
}

// Verify authentication request credentials
exports.verifyCredentials = (tableName) => {
  return (req, res) => {
    const {email, password} = req.payload;

    return knex.first('*')
    .from(tableName).where('email', email)
    .then(function(user) {
      if (!user) {
        return res(Boom.unauthorized('Incorrect email or password!'));
      }

      bcrypt.compare(password, user.password, (err, isValid) => {
        if (isValid) {
          res(user);
        }
        else {
          res(Boom.unauthorized('Incorrect email or password!'));
        }
      });
    })
    .catch(function(e) {
      console.log(e);
      res(Boom.unauthorized('Incorrect email or password!'));
    });
  }
};

// Get EMPLOYEE data from jwt
// DO NOT USE THIS TO GET MOBILE USER DATA!
exports.bindAdminData = function(req, res) {
  /*
  try {
    const bearerToken = req.headers.authorization.slice(7);
    const decoded = jwt.verify(bearerToken, secret, {
      ignoreExpiration: false
    });
    const employeeId = decoded.id;
    const name = decoded.name;

    console.log(decoded);

    knex.first('id').from('Team').where({id: employeeId, name: name})
    .then(function(employee) {
      if (!employee) {
      } else {
      }
    })
    .catch(function(err) {
    });
  } catch (e) {

  }*/
}

const bearerRegex = /Bearer\s+(.*)/i;

// Get data from jwt
exports.bindTeamData = function(req, res){
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
