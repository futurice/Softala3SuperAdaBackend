exports.up = function(knex, Promise) {
  return knex.schema.table('Company', function(table) {
    table.decimal('positionX');
    table.decimal('positionY');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('Company', function(table) {
    table.dropColumn('positionX');
    table.dropColumn('positionY');
  })
};
