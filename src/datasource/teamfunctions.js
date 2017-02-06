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
  knex('Team')
    .where('teamId', teamId)
    .del()
    .then(exports.getAllTeams)
);

exports.getDetails = (teamId) => (
  knex('Team')
    .first()
    .where({"teamId": teamId })
    .leftJoin('Document', 'Document.docId', 'Team.docId')
    .select('teamId', 'teamName', 'description', 'file')
    .then((result) => {
      result.file = result.file ? 'data:image/png;base64,' + result.file.toString('base64') : null;
      return result;
    })
);

exports.getTeamLogo = (teamId) => (
  knex('Team')
    .first('file')
    .where('teamId', teamId)
    .rightJoin('Document', 'Team.docId', 'Document.docId')
    .then((results) => results && results.file)
);

exports.getAllTeams = () => (
  knex('CompanyPoint')
    .select('Team.teamId', 'Team.teamName', 'Team.description', 'Quiz.points as quizpoints')
    .rightJoin('Team', 'Team.teamId', 'CompanyPoint.teamId')
    .sum('CompanyPoint.points as points')
    .groupBy('Team.teamId', 'quizpoints')
    .leftJoin('Quiz', 'Team.teamId', 'Quiz.teamId')
    .orderByRaw('points DESC NULLS LAST, quizpoints DESC NULLS LAST')
)

// TODO: filter
exports.getTeamsAsCompany = (filter, companyId) => (
  knex
    .select('Team.teamId', 'Team.teamName', 'Team.description', 'Team.docId', 'sub.points')
    .from(function() {
      // Get all points that company has given
      this
        .select('Team.teamId', 'teamName', 'description', 'docId', 'points')
        .from('Team')
        .leftJoin('CompanyPoint', 'CompanyPoint.teamId', 'Team.teamId')
        .where('companyId', companyId)
        .as('sub')
    })
    .rightJoin('Team', 'sub.teamId', 'Team.teamId')
)

/*
// TODO: refactor
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
*/

exports.attachDocumentToTeam = (docId, teamId) => (
  knex('Team')
    .where('teamId', teamId)
    .update('docId', docId)
);

exports.updateTeamDescription = (teamId, description) => (
  knex('Team')
    .where('teamId', teamId)
    .update({
      description
    })
    .returning('*')
    .then((results) => {
      return results[0];
    })
);
