if (process.env.NODE_ENV === 'production' && !process.env.SUPERADA_SECRET) {
  console.log('ERROR: SUPERADA_SECRET environment variable not set,');
  console.log('and running in NODE_ENV=production. Refusing to continue!');
  process.exit(1);
}

exports.secret = process.env.SUPERADA_SECRET || 'really_secret_key';

exports.db = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host : '127.0.0.1',
    user : 'postgres', /* whoami */
    password : '',
    database : 'superada',
    ssl: false
  }
};
