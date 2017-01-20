'use strict';

var knex = require('../db').knexlocal;
var logErrors = require('../db').logErrors;

exports.getCompany = function(name, callback){
  knex.select("companyId").from("Company").where({"companyName": name })
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


exports.getCompanies = function(teamId) {
  return knex
    .select('Company.companyId', 'companyName', 'points', 'docId')
    .from('CompanyPoint')
    .rightJoin('Company', 'Company.companyId', 'CompanyPoint.companyId')
    .where('teamId', teamId)
    .orWhere('teamId', null) // in case company hasn't given points to team yet
    .orderBy('Company.companyId');
};

exports.addCompany = function(company, callback){
  knex("Company").insert(company)
    .returning("companyId")
    .then(function(re) {
      callback(null, re);
    })
    .catch(function(err) {
      if(logErrors){
        console.log('Something went wrong!', err);
      }
      callback(err);
    });
};
