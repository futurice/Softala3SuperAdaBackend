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

exports.addCompany = function(, callback){
    knex.select("companyId")
    .from("Company")
    .where({"companyName": company.companyName })
    .then(function(result) {
      var exists = false; // Company name exists?
      if(result != null && typeof result[0] !== 'undefined' && result[0].companyId != 'undefined'){
        exists = result[0].companyId > 0;
      }
      if(exists){
        callback("Duplicate name", null);
      }else{
        knex("Company").insert(Company)
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
      }
    })
    .catch(function(err) {
      if(logErrors){
        console.log('Something went wrong!', err);
      }
      callback(err);
    });
  };

  exports.addQuestion = function(question, callback) {
   knex('Questions').insert({question})
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
