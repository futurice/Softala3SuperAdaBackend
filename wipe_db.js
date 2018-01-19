/* eslint-disable no-console */

const prompt = require('prompt');
const config = require('./src/config');
const knex = require('knex');

const schema = {
  properties: {
    confirmation: {
      required: true,
    },
  },
};

console.log('WARNING! This will wipe the database at:');
console.log(config.db || 'postgres@localhost/superada');
console.log('Are you sure? (y/n)');
prompt.start();

prompt.get(schema, async (err, result) => {
  if (err) {
    process.exit(1);
  }

  if (result.confirmation !== 'y') {
    console.log('Quitting.');
    process.exit(1);
  }

  const no_db_config = JSON.parse(JSON.stringify(config.db)); // legit deep-clone method
  no_db_config.connection.database = 'postgres'; // seems to be the default DB name

  console.log(no_db_config);
  const knex_no_db = knex(no_db_config);
  const knex_connect_db = knex(config.db);

  // Create the DB
  try {
    await knex_no_db.raw(`CREATE DATABASE ${config.db.connection.database};`);
  } catch(e) {
    // Ignore errors here, most likely DB existed :-)
  }

  await knex_connect_db.raw('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  
  console.log('Successfully wiped database.');
  process.exit(0);
});
