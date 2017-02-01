'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

exports.getTeam = (name) => (
  knex('Team')
    .first()
    .where('teamName', name)
    .returning('*')
);

exports.createTeam = (name) => (
  knex('Team')
    .insert({ teamName: name, description: '' })
    .then(exports.getAllTeams)
);

exports.deleteTeam = (teamId) => (
  console.log(teamId) ||
  knex('Team')
    .where('teamId', teamId)
    .del()
    .then(exports.getAllTeams)
);

exports.getDetails = function(teamId, callback){
  /*
    SELECT "Team"."description", "Document"."file"
    FROM "Team"
    LEFT JOIN "Document" on "Document"."docId" = "Team"."docId"
    WHERE "Team"."teamId" = 27;
    */
  return knex('Team')
    .first()
    .where({"teamId": teamId })
    .leftJoin('Document', 'Document.docId', 'Team.docId')
    .select('teamId', 'teamName', 'description', 'file')
    .then((result) => {
      result.file = result.file ? 'data:image/png;base64,' + result.file.toString('base64') : null;
      return result;
    });
};

exports.addTeam = function(team, callback){
  knex.select("teamId")
    .from("Team")
    .where({"teamName": team.teamName })
    .then(function(result) {
      var exists = false; // Team name exists?
      if(result != null && typeof result[0] !== 'undefined' && result[0].teamId != 'undefined'){
        exists = result[0].teamId > 0;
      }
      if(exists){
        callback("Duplicate name", null);
      }else{
        knex("Team").insert(team)
          .returning("teamId")
          .then(function(re) {
            callback(null, re);
          })
          .catch(function(err) {
            if(logErrors){
              console.log('Something went wrong!', err);
            }
            callback(err);
          });
      }
    })
    .catch(function(err) {
      if(logErrors){
        console.log('Something went wrong!', err);
      }
      callback(err);
    });
};

exports.getAllTeams = () => (
  knex
    .select('Team.teamId', 'Team.teamName', 'Team.description')
    .from('CompanyPoint')
    .rightJoin('Team', 'Team.teamId', 'CompanyPoint.teamId')
    .sum('points as points')
    .groupBy('Team.teamId')
    .orderByRaw('points DESC NULLS LAST')
)

// getTeamList: Get list of teams. takes in searchfilter
exports.getTeamList = function(searchfilter, companyId, callback){
  var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,\/{}|\\":<>\?]/); //unacceptable chars
  if (pattern.test(searchfilter)) {
    searchfilter ="";//Empty string for safety
    if(logErrors){
      console.log("Illegal chars in search field")
    }
  }

  var lowercaseSF = searchfilter.toLowerCase()
  knex.select('Team.*', 'CompanyPoint.point', 'Document.file')
    .from("Team")
    .joinRaw('LEFT JOIN "CompanyPoint" on "Team"."teamId" = "CompanyPoint"."teamId" AND "CompanyPoint"."companyId" = '+ companyId+ ' ')
    .leftJoin('Document', 'Document.docId', 'Team.docId')
    .whereRaw(' LOWER( "teamName" ) LIKE ' + '\'%'+lowercaseSF+'%\'')
    .orderBy('Team.teamName', 'asc')
    .then(function(results) {
      callback(null, results);
    })
    .catch(function(err) {
      if(logErrors){
        console.log('Something went wrong!', err);
      }
      callback(err);
    });
};

exports.attachDocumentToTeam = (docId, teamId) => {
  return knex('Team')
    .where('teamId', teamId)
    .update('docId', docId);
};

exports.updateTeamDescription = (teamId, description) => {
  return knex("Team")
    .where('teamId', '=', teamId)
    .update({
      description: description
    })
    .returning('*')
    .then((results) => {
      return results[0];
    });
};
