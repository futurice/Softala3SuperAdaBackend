'use strict';

var knex = require('../db').knexlocal;

const upsertItem = require('../utils/dbUtil').upsertItem;

exports.addCompanyPoint = (companyId, teamId, points) => (
  // TODO: transaction, upsert somehow?
  knex('CompanyPoint')
    .where({ companyId, teamId })
    .then((result) => {
      if (result.length) {
        return true;
      }

      return false;
    })
    .then((exists) => (
      exists
      // exists true: perform update
      ? knex('CompanyPoint')
          .where({ companyId, teamId })
          .update({ points })
      // exists false: perform insertion
      : knex('CompanyPoint')
          .insert(({ companyId, teamId, points }))
    ))
);

exports.clearCompanyPoint = (companyId, teamId) => (
  knex('CompanyPoint')
    .where({ companyId, teamId })
    .del()
);
