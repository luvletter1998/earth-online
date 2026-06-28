const router = require('express').Router();
const knex = require('../db');
const { auth } = require('../middleware/auth');

// List all achievements
router.get('/', async (req, res) => {
  try {
    let q = knex('achievements');
    if (req.query.category) q = q.where({ category: req.query.category });
    if (req.query.rarity) q = q.where({ rarity: req.query.rarity });
    const list = await q.orderBy('points', 'desc');
    res.json(list);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Unlock an achievement
router.post('/:id/unlock', auth, async (req, res) => {
  try {
    const aid = parseInt(req.params.id);
    const exist = await knex('user_achievements').where({ user_id: req.user.id, achievement_id: aid }).first();
    if (exist) return res.status(400).json({ error: '已解锁过此成就' });
    const ach = await knex('achievements').where({ id: aid }).first();
    if (!ach) return res.status(404).json({ error: '成就不存在' });
    await knex('user_achievements').insert({ user_id: req.user.id, achievement_id: aid, story: req.body.story || '' });
    await knex('users').where({ id: req.user.id }).increment('points', ach.points);
    res.json({ success: true, points_earned: ach.points, achievement: ach });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// AI generate custom achievement
router.post('/generate', auth, async (req, res) => {
  try {
    const { story } = req.body;
    if (!story || story.length < 5) return res.status(400).json({ error: '请多写一点你的经历（至少5个字）' });
    const key = process.env.SILICONFLOW_API_KEY;
    if (!key) return res.status(400).json({ error: 'AI生成功能未配置API Key' });
    const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: `你是一个"地球Online"成就系统。根据以下玩家经历，生成一个成就。严格输出JSON，不要其他文字:\n{"title":"成就名","description":"成就描述","category":"生存|社交|职场|宅家|奇葩","icon":"一个emoji","points":数字5-50,"rarity":"普通|稀有|史诗|传说"}\n\n经历：${story}` }],
        temperature: 0.8, max_tokens: 300
      })
    });
    const data = await resp.json();
    if (!data.choices?.[0]?.message?.content) return res.status(500).json({ error: 'AI返回异常' });
    const txt = data.choices[0].message.content;
    const match = txt.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'AI返回格式异常' });
    const ach = JSON.parse(match[0]);
    ach.points = Math.min(50, Math.max(5, Math.round(ach.points / 5) * 5));
    if (!['普通','稀有','史诗','传说'].includes(ach.rarity)) ach.rarity = '普通';
    if (!['生存','社交','职场','宅家','奇葩'].includes(ach.category)) ach.category = '奇葩';
    ach.unlock_condition = 'AI生成';
    const [saved] = await knex('achievements').insert({
      category: ach.category, title: ach.title, description: ach.description,
      icon: ach.icon, points: ach.points, rarity: ach.rarity, unlock_condition: 'AI生成'
    }).returning('*');
    await knex('user_achievements').insert({ user_id: req.user.id, achievement_id: saved.id, story, is_custom: true });
    await knex('users').where({ id: req.user.id }).increment('points', ach.points);
    res.json({ achievement: saved, points_earned: ach.points });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
