'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

exports.getCompany = (companyName) => (
  knex('Company')
    .first('companyId')
    .where('companyName', companyName)
);

exports.getCompanies = () => (
  knex('Company')
    .select('companyId', 'companyName')
    .orderBy('companyName')
);

exports.createCompany = (companyName) => (
  knex('Company')
    .insert({ companyName })
    .returning('*')
);

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
      this
        .select('Company.companyId', 'companyName', 'points')
        .from('Company')
        .leftJoin('CompanyPoint', 'CompanyPoint.companyId', 'Company.companyId')
        .where('teamId', teamId)
        .as('sub')
    })
    .rightJoin('Company', 'sub.companyId', 'Company.companyId')
);
