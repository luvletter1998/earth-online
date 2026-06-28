const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    const achievements = await db.getUserAchievements(req.user.id);
    res.json({ user: { id: user.id, username: user.username, level: user.level, points: user.points }, achievements });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
