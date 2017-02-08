'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;
const path = require('path');
const Jimp = require('jimp');
const documentfunctions = require('./documentfunctions');

let circle = null;

Jimp.read(path.join(__dirname, '..', '..', 'assets', 'companyCircle.png'))
.then((image) => { circle = image });

exports.getCompanyByName = (companyName) => (
  knex('Company')
    .first('companyId')
    .where('companyName', 'ilike', companyName)
);

exports.getCompanyLogo = (companyId) => (
  knex('Company')
    .first('file')
    .where('companyId', companyId)
    .rightJoin('Document', 'Company.docId', 'Document.docId')
    .then((results) => results && results.file)
);

exports.getCompanies = () => (
  knex('Company')
    .select('companyId', 'companyName')
    .orderBy('companyName')
);

exports.createCompany = (companyName, logo) => {
  // parse the base64 encoded logo into buffer
  const matches = logo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const file = {};

  if (matches.length !== 3) {
    throw new Error('Invalid input string');
  }

  file.type = matches[1];
  file.data = new Buffer(matches[2], 'base64');

  // resize and mask with circle
  return Jimp.read(file.data)
  .then((image) => (
    new Promise((resolve, reject) => (
      image
        .resize(180, 180)
        .mask(circle, 0, 0)
        .getBuffer(Jimp.MIME_PNG, (err, data) => {
          resolve(data);
        })
    ))
  ))
  .then((file) => (
    documentfunctions.saveDocument(file)
  ))
  .then((docId) => (
    knex('Company')
      .insert({
        companyName,
        docId
      })
  ))
  .then(exports.getCompanies)
};

exports.deleteCompany = (companyId) => (
  knex('Company')
    .where('companyId', companyId)
    .del()
    .then(exports.getCompanies)
);

exports.getCompaniesAsTeam = (teamId) => (
  knex
    .select('Company.companyId', 'Company.companyName', 'sub.points')
    .from(function() {
      // Get all points that team has been given by companies
      this
        .select('Company.companyId', 'companyName', 'points')
        .from('Company')
        .leftJoin('CompanyPoint', 'CompanyPoint.companyId', 'Company.companyId')
        .where('teamId', teamId)
        .as('sub')
    })
    .rightJoin('Company', 'sub.companyId', 'Company.companyId')
);
