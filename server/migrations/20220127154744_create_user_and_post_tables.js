exports.up = function(knex) {
  return knex.schema
    // .createTable('users', (table) => {
    //   table.increments('id').primary();
    //   table.integer('github_id');
    //   table.string('avatar_url');
    //   table.string('password_hash');
    //   table.string('salt');
    //   table.string('username').notNullable();
    //   table.timestamp('updated_at').defaultTo(knex.fn.now());
    // })
    // .createTable('players', (table) => {
    //   table.increments('id').primary();
    //   table.string('name');
    //   table.string('position');
    // })
    // .createTable('teams_players', (table) => {
    //   table.increments('id').primary();
    //   table.string('team');
    //   table.string('name');
    //   table.string('position');
    // });
    // .createTable('posts', (table) => {
    //   table.increments('id').primary();
    //   table.integer('user_id').unsigned().notNullable();
    //   table.string('title', 75 ).notNullable();
    //   table.text('content').notNullable();
    //   table.timestamp('updated_at').defaultTo(knex.fn.now());
    //   table
    //     .foreign('user_id')
    //     .references('id')
    //     .inTable('users')
    //     .onUpdate('CASCADE')
    //     .onDelete('CASCADE');
    // });
};

// exports.down = function(knex) {
//   return knex.schema.dropTable('players').dropTable('users');
// };