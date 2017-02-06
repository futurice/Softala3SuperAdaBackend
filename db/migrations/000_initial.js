/*eslint-disable func-names*/
'use strict';

exports.up = function(knex) {
  return knex.schema

    .createTable('Question', function(table) {
      table.increments('questionId').primary();
      table.text('questionText').notNullable();
      table.text('questionType').notNullable();
      table.integer('numButtons');
      table.json('labels');
    })

    .createTable('Document', function(table) {
      table.increments('docId').primary();
      table.binary('file').notNullable();
    })

    .createTable('Team', function(table) {
      table.increments('teamId').primary();
      table.text('teamName').notNullable().unique();
      table.text('description').notNullable();

      // optional profile picture
      table.integer('docId').references('docId').inTable('Document').onDelete('SET NULL');
    })

    .createTable('Feedback', function(table) {
      table.integer('teamId').references('teamId').inTable('Team').primary().onDelete('CASCADE');
      table.json('answers').notNullable();
    })

    .createTable('Company', function(table) {
      table.increments('companyId').primary();
      table.text('companyName').notNullable().unique();

      // company logo
      table.integer('docId').references('docId').inTable('Document').onDelete('SET NULL');
    })

    // points given by company to team
    .createTable('CompanyPoint', function(table) {
      table.primary(['teamId', 'companyId']);
      table.integer('points').notNullable();
      table.integer('teamId').references('teamId').inTable('Team').onDelete('CASCADE');
      table.integer('companyId').references('companyId').inTable('Company').onDelete('CASCADE');
    })

    .createTable('Quiz', function(table) {
      table.integer('teamId').primary().references('teamId').inTable('Team').onDelete('CASCADE');
      table.integer('points').notNullable();
    })

    .createTable('Admin', function(table) {
      table.text('email').notNullable().primary();
      table.text('password').notNullable();
    })

    .createTable('Map', function(table) {
      table.text('mapName').primary();
      table.integer('docId').notNullable().references('docId').inTable('Document').onDelete('CASCADE');
    })

    .then(function() {
        //Indexes triggers etc here
    });
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('Admin')
  .dropTableIfExists('Feedback')
  .dropTableIfExists('Question')
  .dropTableIfExists('CompanyPoint')
  .dropTableIfExists('Company')
  .dropTableIfExists('Team')
};
