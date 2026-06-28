const knex = require('knex')({
  client: 'better-sqlite3',
  connection: { filename: './earth_online.db' },
  useNullAsDefault: true
});
module.exports = knex;

(async () => {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', t => {
      t.increments('id'); t.string('username', 50).unique().notNullable();
      t.string('password_hash', 255).notNullable(); t.string('avatar_url', 255).defaultTo('');
      t.integer('level').defaultTo(1); t.integer('points').defaultTo(0); t.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  const hasAch = await knex.schema.hasTable('achievements');
  if (!hasAch) {
    await knex.schema.createTable('achievements', t => {
      t.increments('id'); t.string('category', 20).notNullable(); t.string('title', 100).notNullable();
      t.text('description'); t.string('icon', 10); t.integer('points').defaultTo(10);
      t.string('rarity', 10).defaultTo('普通'); t.text('unlock_condition'); t.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  const hasUA = await knex.schema.hasTable('user_achievements');
  if (!hasUA) {
    await knex.schema.createTable('user_achievements', t => {
      t.increments('id'); t.integer('user_id').references('id').inTable('users');
      t.integer('achievement_id').references('id').inTable('achievements');
      t.timestamp('unlocked_at').defaultTo(knex.fn.now()); t.text('story'); t.boolean('is_custom').defaultTo(false);
    });
  }
  const count = await knex('achievements').count('id as c').first();
  if (count.c === 0) {
    const seeds = require('./seeds/achievements');
    await knex('achievements').insert(seeds);
    console.log('Seeded ' + seeds.length + ' achievements');
  }
  console.log('Database ready');
})();
