const router = require('express').Router();
const knex = require('../db');
const { auth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    const myAchs = await knex('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where('user_achievements.user_id', req.user.id)
      .select('achievements.*', 'user_achievements.unlocked_at', 'user_achievements.story', 'user_achievements.is_custom')
      .orderBy('user_achievements.unlocked_at', 'desc');
    res.json({ user: { id: user.id, username: user.username, level: user.level, points: user.points }, achievements: myAchs });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
