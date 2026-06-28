const router = require('express').Router();
const knex = require('../db');

router.get('/', async (req, res) => {
  try {
    const top = await knex('users').select('id', 'username', 'points', 'level')
      .orderBy('points', 'desc').limit(50);
    res.json(top);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
