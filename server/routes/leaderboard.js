const router = require('express').Router();
const db = require('../db');
router.get('/', async (req, res) => {
  try { res.json(await db.getLeaderboard()); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
