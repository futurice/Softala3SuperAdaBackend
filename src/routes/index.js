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

var routes = [];

const teamConfig = {
  auth: { strategy: 'jwt', scope: 'team' },
  pre: [ { method: authUtil.bindTeamData, assign: 'team' } ]
};
const companyConfig = {
  auth: { strategy: 'jwt', scope: 'company' },
  pre: [ { method: authUtil.bindTeamData, assign: 'company' } ]
};
const adminConfig = {
  auth: { strategy: 'jwt', scope: 'admin' },
  pre: [ { method: authUtil.bindTeamData, assign: 'admin' } ]
};

// helper function which takes a promise returning handler function, arguments
// to call it with, and passes the result to reply
const replyWithResult = (handler, args, reply) => {
  handler.apply(this, args)
    .then(reply)
    .catch((err) => {
      reply(Boom.badImplementation(err));
    });
};

//#Region teamRoutes
routes.push({
  method: 'POST',
  path: '/teams/authenticate',
  config: {
    validate: {
      payload: {
        name: Joi.string().required()
      },
      failAction: (request, reply, source, error) => {
        reply(Boom.unauthorized('Team not found.'));
      }
    }
  },
  handler: (request, reply) => {
    teamDbFunctions.getTeam(request.payload.name)
      .then((team) => {
        if (!team) {
          return reply(Boom.unauthorized('Team not found.'));
        }

        const token = authUtil.createToken(
          team.teamId,
          request.payload.name,
          'team'
        );

        reply( token );
      })
      .catch((err) => {
        reply(Boom.badImplementation(err));
      });
  }
});

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
      {method: authUtil.bindTeamData, assign: "admin"}
    ]
  },

  handler: function(request, reply){
    var team = {  teamName: request.payload.name,
      description: request.payload.description,
      active: 1,
      docId: request.payload.documentId
    }

    teamDbFunctions.addTeam(team,function(err, result){
      //callback
      var success = false;
      var message = '';
      if(result != null && result[0] != null){
        success = result[0] > 0;
      }
      if(!success){
        message = "Adding team failed. Possibly due to dublicate name";
      }

      reply({success: success, message: message });
    }
    );
  } //End of handler
}); //End of POST: /teams

routes.push({
  method: 'POST',
  path: '/teamlist',
  config: {
    validate: {
      payload: {
        searchfilter: Joi.string().allow("")
      }
    },
    auth: {
      strategy: 'jwt',
      scope: 'company'
    },
    pre: [
      {method: authUtil.bindTeamData, assign: "company"}
    ]
  },
  handler: function(request, reply){
    var companyId = request.pre.company.id;

    teamDbFunctions.getTeamList(request.payload.searchfilter, companyId, function(err, result) {

      result.forEach(function(item, index){
        if(item != null && item.file != null){
          item.file = item.file.toString('base64')
        }
      });

      reply({err: err , result: result });
    });
  }
});

routes.push({
  method: 'GET',
  path: '/companies',
  config: teamConfig,
  handler: function(request, reply) {
    replyWithResult(
      companyDbFunctions.getCompanies,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'GET',
  path: '/teamdetails',
  config: teamConfig,
  handler: (request, reply) => {
    replyWithResult(
      teamDbFunctions.getDetails,
      [request.pre.team.id],
      reply
    );
  }
});

routes.push({
  method: 'POST',
  path: '/teamdetails',
  config: Object.assign({}, teamConfig, {
    payload: {
      parse: true,
      maxBytes: 1024 * 1024 * 20 // 20 MB ought to be enough for anybody
    }
  }),
  handler: (request, reply) => {
    let promises = [];

    if (request.payload.description) {
      promises.push(teamDbFunctions.updateTeamDescription(request.pre.team.id, request.payload.description));
    }
    if (request.payload.image) {
      const buf = Buffer.from(request.payload.image, 'base64');
      let resized;

      promises.push(
        // resize image to thumbnail size
        sharp(buf)
        .resize(512, 512)
        .png()
        .toBuffer()
        .then((file) => {
          resized = file.toString('base64');
          return documentDbFunctions.saveDocument({
            file,
            doctype: 1
          })
        })

        .then((result) => {
          if(!result) {
            throw 'Unknown error while adding document. result was: ' + result;
          }

          const docId = result[0];

          // Attach document to team relation
          return teamDbFunctions.attachDocumentToTeam(docId, request.pre.team.id);
        })

        .then((result) => {
          if (!result) {
            throw 'Unknown error while attaching document to team. result was: ' + result;
          }

          return { file: 'data:image/png;base64,' + resized };
        })
      );
    }

    Promise.all(promises)
    .then((result) => {
      result = _.reduce(result, _.extend)
      reply(result);
    })
    .catch((err) => {
      reply(Boom.badImplementation(err));
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
  handler: function (request, reply) {
    var success = false;
    var token = '';

    companyDbFunctions.getCompany(request.payload.name,function(err, result){
      //callback
      var success = false;
      var id = 0;
      if(result != null && result[0] != 'undefined'){
        success = result[0].companyId > 0;
        id = result[0].companyId;
      }

      if(success){
        token = authUtil.createToken(id, request.payload.name, 'company');
      }
      reply({success: success, token: token });
    }
    );
  }
});

//End of POST: /company


//#EndRegion Company

// #Region CompanyPoint
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
      {method: authUtil.bindTeamData, assign: "company"}
    ]
  },

  handler: function(request, reply){
    var companypoint = {
      teamId: request.payload.teamId,
      companyId: request.pre.company.id,
      point: request.payload.point
    }


    companypointDbFunctions.addCompanyPoint(companypoint,function(err, result){

      //callback
      var success = false;
      var message = '';
      if(result != null){
        success = result > 0;
      }

      if(!success){
        message = "Adding points failed";
      }

      reply({success: success, message: message });
    }

    );
  } //End of handler
}); //End of POST: /companypoint


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
      {method: authUtil.bindTeamData, assign: "company"}
    ]
  },
  handler: function(request, reply) {

    var clearPoints = {
      companyId: request.pre.company.id,
      teamId: request.payload.teamId
    }

    companypointDbFunctions.clearCompanyPoint(clearPoints,function(err, result) {

      //callback
      var success = false;
      var message = '';
      if(result != null){
        success = result > 0;
      }

      if(!success){
        message = "Clearing points failed";
      }

      reply({success: success, message: message });
    }
    );
  }
});

routes.push({
  method: 'GET',
  path: '/companypoints',
  config: teamConfig,
  handler: function(request, reply) {
    replyWithResult(
      companypointDbFunctions.getCompanyPoints,
      [request.pre.team.id],
      reply
    );
  }
});

//#Region feedback
routes.push({
  method: 'POST',
  path: '/feedback',
  config: Object.assign({}, teamConfig, {
    validate: {
      payload: {
        schoolGrade: Joi.number(),
        answer1: Joi.string().allow(""),
        answer2: Joi.string().allow(""),
        answer3: Joi.string().allow(""),
        answer4: Joi.string().allow(""),
        answer5: Joi.string().allow("")
      }
    }
  }),
  handler: function(request, reply) {
    var feedback = {  schoolGrade: request.payload.schoolGrade,
      answer1: request.payload.answer1,
      answer2: request.payload.answer2,
      answer3: request.payload.answer3,
      answer4: request.payload.answer4,
      answer5: request.payload.answer5
    }
    feedbackDbFunctions.saveFeedback(feedback,function(err, result){

      //callback
      var success = false;
      var message = '';

      if(result != null && result[0] != null){
        success = result[0] > 0;
      }

      if(!success){
        message = "Adding feedback failed";
      }

      reply({success: success, message: message });
    }
    );
  }//End of handler
});//End of POST: /feedback
//#EndRegion feedback

//#Region admin routes
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
  handler: function(request, reply){
    adminDbFunctions.findAdmin(request.payload.admin, request.payload.password ,function(success){

      var token = '';

      if(success){
        token = authUtil.createToken(1, request.payload.admin, 'admin');
      }

      reply({success: success, token:token });
    })
  }
});

//#EndRegion admin routes

//#Region DocumentRoutes

//End of POST: /teams

//#EndRegion DocumentRoutes
module.exports = routes;
