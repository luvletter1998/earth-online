const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const list = await db.getAchievements(req.query.category, req.query.rarity);
    res.json(list);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/unlock', auth, async (req, res) => {
  try {
    const aid = parseInt(req.params.id);
    const exist = await db.findUserAchievement(req.user.id, aid);
    if (exist) return res.status(400).json({ error: '已解锁过此成就' });
    const ach = await db.getAchievement(aid);
    if (!ach) return res.status(404).json({ error: '成就不存在' });
    await db.addUserAchievement({ user_id: req.user.id, achievement_id: aid, story: req.body.story || '', is_custom: false });
    await db.updateUser(req.user.id, { points: (await db.getUser(req.user.id)).points + ach.points });
    res.json({ success: true, points_earned: ach.points, achievement: ach });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { story } = req.body;
    if (!story || story.length < 5) return res.status(400).json({ error: '请多写一点你的经历' });
    const key = process.env.SILICONFLOW_API_KEY;
    if (!key) return res.status(400).json({ error: 'AI功能未配置' });
    const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: `你是一个"地球Online"成就系统。根据玩家经历生成成就。输出JSON:\n{"title":"成就名","description":"描述","category":"生存|社交|职场|宅家|奇葩","icon":"emoji","points":5-50,"rarity":"普通|稀有|史诗|传说"}\n经历：${story}` }],
        temperature: 0.8, max_tokens: 300
      })
    });
    const data = await resp.json();
    const txt = data.choices?.[0]?.message?.content || '';
    const match = txt.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'AI返回异常' });
    const ach = JSON.parse(match[0]);
    ach.points = Math.min(50, Math.max(5, Math.round(ach.points / 5) * 5));
    if (!['普通','稀有','史诗','传说'].includes(ach.rarity)) ach.rarity = '普通';
    if (!['生存','社交','职场','宅家','奇葩'].includes(ach.category)) ach.category = '奇葩';
    const saved = await db.createAchievement({ ...ach, unlock_condition: 'AI生成' });
    await db.addUserAchievement({ user_id: req.user.id, achievement_id: saved.id, story, is_custom: true });
    await db.updateUser(req.user.id, { points: (await db.getUser(req.user.id)).points + ach.points });
    res.json({ achievement: saved, points_earned: ach.points });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
