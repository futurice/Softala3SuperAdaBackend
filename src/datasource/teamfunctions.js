'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;
const path = require('path');
const Jimp = require('jimp');
const documentfunctions = require('./documentfunctions');

let circle = null;

Jimp.read(path.join(__dirname, '..', '..', 'assets', 'teamCircle.png'))
.then((image) => { circle = image });

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

exports.updateTeamImage = (teamId, image) => {
  const buf = Buffer.from(image, 'base64');
  let resized;

  // resize image to thumbnail size
  return Jimp.read(buf)
  .then((image) => (
    new Promise((resolve, reject) => (
      image
      .resize(512, 512)
      .mask(circle, 0, 0)
      .getBuffer(Jimp.MIME_PNG, (err, data) => {
        resolve(data);
      })
    ))
  ))
  .then((file) => {
    resized = file.toString('base64');
    return documentfunctions.saveDocument(file)
  })
  .then((docId) => (
    // Attach document to team relation
    exports.attachDocumentToTeam(docId, teamId)
  ))

  .then((result) => {
    if (!result) {
      throw 'Unknown error while attaching document to team. result was: ' + result;
    }

    return { file: 'data:image/png;base64,' + resized };
  })
}
