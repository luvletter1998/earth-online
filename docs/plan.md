# 地球Online 成就系统 — 实现计划

> **Goal:** 建立一个"人生如游戏"的成就系统网站，含个人主页、成就百科、AI生成器、排行榜

**Architecture:** React SPA 前端 + Express REST API 后端 + PostgreSQL 数据库，JWT 认证，单项目 monorepo 结构

**Tech Stack:** React 18 + Vite + React Router 6 | Node.js + Express + Knex.js | PostgreSQL | JWT + bcrypt | SiliconFlow API

## 全局约束
- 所有 API 返回 JSON，错误格式 `{ error: string }`
- 前端路由 6 个：/ /login /register /profile /library /generator /leaderboard
- 密码 bcrypt 哈希，JWT 24h 过期

---

## 文件结构

```
earth-online/
├── client/                    # React 前端
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js            # 统一 API 请求
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Library.jsx
│   │   │   ├── Generator.jsx
│   │   │   └── Leaderboard.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── AchievementCard.jsx
│   │       └── RarityBadge.jsx
│   └── index.html
├── server/                    # Node.js 后端
│   ├── index.js
│   ├── db.js                  # Knex 配置
│   ├── middleware/
│   │   └── auth.js            # JWT 中间件
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── achievements.js
│   │   └── leaderboard.js
│   └── seeds/
│       └── achievements.js    # 预置成就数据
├── package.json
└── docs/
    ├── spec.md
    └── plan.md
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `client/` (Vite React scaffold)
- Create: `server/` 目录
- Create: `package.json`

- [ ] **Step 1: 创建客户端**

```bash
cd ~/earth-online && npm create vite@latest client -- --template react
cd client && npm install && npm install react-router-dom
```

- [ ] **Step 2: 创建服务端**

```bash
mkdir -p ~/earth-online/server/routes ~/earth-online/server/middleware ~/earth-online/server/seeds
cd ~/earth-online && npm init -y
npm install express cors knex pg bcryptjs jsonwebtoken dotenv
```

- [ ] **Step 3: 创建根 package.json scripts**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "client": "cd client && npm run dev",
    "server": "node server/index.js"
  }
}
```

---

### Task 2: 数据库

**Files:**
- Create: `server/db.js`
- Create: `server/seeds/achievements.js`

- [ ] **Step 1: db.js — Knex 配置**

```js
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost', port: 5432,
    user: 'postgres', password: 'postgres', database: 'earth_online'
  }
});
module.exports = knex;
```

- [ ] **Step 2: 建表脚本（手动执行一次）**

```sql
CREATE DATABASE earth_online;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) DEFAULT '',
  level INT DEFAULT 1,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  points INT DEFAULT 10,
  rarity VARCHAR(10) DEFAULT '普通',
  unlock_condition TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  achievement_id INT REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  story TEXT,
  is_custom BOOLEAN DEFAULT FALSE
);
```

- [ ] **Step 3: 种子数据 — 预置 25 个成就**

```js
// server/seeds/achievements.js
const achievements = [
  { category:'生存', title:'日出见证者', description:'连续7天在早上7:00前起床', icon:'🌅', points:20, rarity:'稀有', unlock_condition:'连续7天7:00前签到' },
  { category:'生存', title:'奶茶品鉴师', description:'一个月内品尝10种不同口味的奶茶', icon:'🧋', points:10, rarity:'普通', unlock_condition:'记录10种不同奶茶' },
  { category:'生存', title:'熬夜冠军', description:'凌晨3:00后睡觉，累计30天', icon:'🦉', points:30, rarity:'史诗', unlock_condition:'累计30天3:00后睡觉' },
  { category:'生存', title:'外卖达人', description:'一个月点外卖超过20次', icon:'🛵', points:15, rarity:'稀有', unlock_condition:'月外卖订单≥20' },
  { category:'生存', title:'健身三分钟', description:'连续3天去健身房（第4天自动失效）', icon:'🏃', points:50, rarity:'传说', unlock_condition:'连续3天健身房打卡' },
  { category:'社交', title:'社恐突破', description:'主动和陌生人说了第一句话', icon:'💀', points:40, rarity:'稀有', unlock_condition:'和陌生人完成一次对话' },
  { category:'社交', title:'朋友圈失踪人口', description:'连续30天不发朋友圈', icon:'👻', points:15, rarity:'普通', unlock_condition:'30天零朋友圈' },
  { category:'社交', title:'群聊潜水员', description:'在一个群里潜水超过一年，从未发过言', icon:'🤿', points:20, rarity:'稀有', unlock_condition:'群内365天零发言' },
  { category:'社交', title:'相亲勇士', description:'完成一次相亲', icon:'⚔️', points:30, rarity:'史诗', unlock_condition:'完成相亲' },
  { category:'社交', title:'谁请客', description:'和朋友吃饭成功逃单', icon:'🏃', points:25, rarity:'稀有', unlock_condition:'朋友请客一次' },
  { category:'职场', title:'会议忍者', description:'在一场超过30分钟的会议中零发言完美隐身', icon:'🥷', points:20, rarity:'史诗', unlock_condition:'30分钟会议零发言' },
  { category:'职场', title:'加班战神', description:'连续加班超过72小时', icon:'💼', points:30, rarity:'传说', unlock_condition:'72h连续工作' },
  { category:'职场', title:'PPT 流水线', description:'一周内做出3份不同的PPT', icon:'📊', points:15, rarity:'普通', unlock_condition:'周产3份PPT' },
  { category:'职场', title:'摸鱼大师', description:'上班时间刷完一部完整电视剧', icon:'🎣', points:25, rarity:'史诗', unlock_condition:'工作时间追完一部剧' },
  { category:'职场', title:'甩锅高手', description:'成功将Bug责任转移给同事', icon:'🍳', points:10, rarity:'普通', unlock_condition:'甩锅一次' },
  { category:'宅家', title:'周末封印', description:'整个周末不出家门一步', icon:'🏠', points:10, rarity:'普通', unlock_condition:'48h不出门' },
  { category:'宅家', title:'快递收割者', description:'一周收到5个以上快递', icon:'📦', points:10, rarity:'普通', unlock_condition:'周收5快递' },
  { category:'宅家', title:'追番狂魔', description:'一天内看完一部完整番剧（12集以上）', icon:'📺', points:20, rarity:'稀有', unlock_condition:'日刷12集' },
  { category:'宅家', title:'B站元老', description:'B站注册超过10年', icon:'🎬', points:40, rarity:'传说', unlock_condition:'B站账号≥10年' },
  { category:'宅家', title:'满级拖延', description:'DDL前1小时才开始干活并成功提交', icon:'⏰', points:25, rarity:'稀有', unlock_condition:'DDL前1h完成' },
  { category:'奇葩', title:'反向减肥', description:'办了健身卡后一个月内体重增加', icon:'🍔', points:5, rarity:'普通', unlock_condition:'办卡后体重↑' },
  { category:'奇葩', title:'地铁占座王', description:'高峰期抢到座位并坐过站', icon:'🚇', points:15, rarity:'稀有', unlock_condition:'高峰期抢座+坐过站' },
  { category:'奇葩', title:'误入传销', description:'接到诈骗电话后聊了超过10分钟', icon:'📞', points:20, rarity:'史诗', unlock_condition:'接诈骗电话>10min' },
  { category:'奇葩', title:'插队反杀', description:'被人插队后成功让对方出队', icon:'🗡️', points:25, rarity:'稀有', unlock_condition:'反插队成功' },
  { category:'奇葩', title:'朋友圈点赞机器人', description:'给所有好友的朋友圈逐条点赞', icon:'🤖', points:30, rarity:'史诗', unlock_condition:'全好友逐条点赞' },
];
module.exports = achievements;
```

---

### Task 3: 后端 Auth API

**Files:**
- Create: `server/routes/auth.js`
- Create: `server/middleware/auth.js`
- Modify: `server/index.js`

- [ ] **Step 1: auth middleware**

```js
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'earth-online-secret';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '请先登录' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token 已过期' }); }
}
module.exports = { auth, SECRET };
```

- [ ] **Step 2: auth routes**

```js
// server/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db');
const { SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
  const exist = await knex('users').where({ username }).first();
  if (exist) return res.status(400).json({ error: '用户名已存在' });
  const hash = await bcrypt.hash(password, 10);
  const [user] = await knex('users').insert({ username, password_hash: hash }).returning(['id', 'username', 'level', 'points']);
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '24h' });
  res.json({ user, token });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await knex('users').where({ username }).first();
  if (!user) return res.status(400).json({ error: '用户不存在' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: '密码错误' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '24h' });
  res.json({ user: { id: user.id, username: user.username, level: user.level, points: user.points }, token });
});

module.exports = router;
```

---

### Task 4: 后端 Achievement & Profile API

**Files:**
- Create: `server/routes/achievements.js`
- Create: `server/routes/users.js`
- Create: `server/routes/leaderboard.js`
- Modify: `server/index.js`

- [ ] **Step 1: 成就路由**

```js
// server/routes/achievements.js
const router = require('express').Router();
const knex = require('../db');
const { auth } = require('../middleware/auth');

// 全成就列表（可按分类/稀有度筛选）
router.get('/', async (req, res) => {
  let q = knex('achievements');
  if (req.query.category) q = q.where({ category: req.query.category });
  if (req.query.rarity) q = q.where({ rarity: req.query.rarity });
  const list = await q.orderBy('points', 'desc');
  res.json(list);
});

// 解锁成就
router.post('/:id/unlock', auth, async (req, res) => {
  const exist = await knex('user_achievements').where({ user_id: req.user.id, achievement_id: req.params.id }).first();
  if (exist) return res.status(400).json({ error: '已解锁' });
  await knex('user_achievements').insert({ user_id: req.user.id, achievement_id: req.params.id, story: req.body.story || '' });
  const ach = await knex('achievements').where({ id: req.params.id }).first();
  await knex('users').where({ id: req.user.id }).increment('points', ach.points);
  res.json({ success: true, points_earned: ach.points });
});

// AI 生成自定义成就（调用 SiliconFlow）
router.post('/generate', auth, async (req, res) => {
  const { story } = req.body;
  if (!story) return res.status(400).json({ error: '请描述你的经历' });
  // Call SiliconFlow API
  const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [{ role: 'user', content: `根据以下经历，生成一个"地球Online"游戏成就。输出JSON格式: {"title":"成就名","description":"描述","category":"生存/社交/职场/宅家/奇葩","icon":"一个emoji","points":5-50,"rarity":"普通/稀有/史诗/传说"}\n\n经历：${story}` }],
      temperature: 0.8,
    })
  });
  const data = await resp.json();
  const ach = JSON.parse(data.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
  ach.points = Math.min(50, Math.max(5, Math.round(ach.points / 5) * 5));
  const validRarities = ['普通','稀有','史诗','传说'];
  if (!validRarities.includes(ach.rarity)) ach.rarity = '普通';
  const validCats = ['生存','社交','职场','宅家','奇葩'];
  if (!validCats.includes(ach.category)) ach.category = '奇葩';

  const [saved] = await knex('achievements').insert({
    category: ach.category, title: ach.title, description: ach.description,
    icon: ach.icon, points: ach.points, rarity: ach.rarity, unlock_condition: 'AI生成'
  }).returning('*');
  await knex('user_achievements').insert({ user_id: req.user.id, achievement_id: saved.id, story, is_custom: true });
  await knex('users').where({ id: req.user.id }).increment('points', ach.points);
  res.json({ achievement: saved, points_earned: ach.points });
});

module.exports = router;
```

- [ ] **Step 2: 用户路由**

```js
// server/routes/users.js
const router = require('express').Router();
const knex = require('../db');
const { auth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  const user = await knex('users').where({ id: req.user.id }).first();
  const myAchs = await knex('user_achievements')
    .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
    .where('user_achievements.user_id', req.user.id)
    .select('achievements.*', 'user_achievements.unlocked_at', 'user_achievements.story', 'user_achievements.is_custom');
  res.json({ user: { id: user.id, username: user.username, level: user.level, points: user.points }, achievements: myAchs });
});

module.exports = router;
```

- [ ] **Step 3: 排行榜**

```js
// server/routes/leaderboard.js
const router = require('express').Router();
const knex = require('../db');

router.get('/', async (req, res) => {
  const top = await knex('users')
    .select('id', 'username', 'points', 'level')
    .orderBy('points', 'desc').limit(50);
  res.json(top);
});
module.exports = router;
```

---

### Task 5: 前端 — 基础框架

**Files:**
- Create: `client/src/api.js`
- Create: `client/src/components/Navbar.jsx`
- Create: `client/src/components/AchievementCard.jsx`
- Create: `client/src/components/RarityBadge.jsx`
- Modify: `client/src/App.jsx`, `client/src/App.css`

- [ ] **Step 1: API 封装**

```js
// client/src/api.js
const BASE = 'http://localhost:3001/api';
const token = () => localStorage.getItem('token');

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const t = token(); if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
```

- [ ] **Step 2: Navbar 组件**

```jsx
// client/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
export default function Navbar() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nav = useNavigate();
  const logout = () => { localStorage.clear(); nav('/'); };
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🌍 地球Online</Link>
      <div className="nav-links">
        <Link to="/library">成就百科</Link>
        <Link to="/leaderboard">排行榜</Link>
        {token ? <>
          <Link to="/generator">生成器</Link>
          <Link to="/profile">{user.username}</Link>
          <button onClick={logout}>退出</button>
        </> : <>
          <Link to="/login">登录</Link>
          <Link to="/register">注册</Link>
        </>}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: AchievementCard 组件**

```jsx
// client/src/components/AchievementCard.jsx
import RarityBadge from './RarityBadge';
export default function AchievementCard({ ach, unlocked, story, onUnlock }) {
  return (
    <div className={`ach-card ${unlocked ? 'unlocked' : 'locked'} rarity-${ach.rarity}`}>
      <div className="ach-icon">{ach.icon}</div>
      <div className="ach-info">
        <h3>{unlocked ? ach.title : '???'}</h3>
        {unlocked && <p>{ach.description}</p>}
        <div className="ach-meta">
          <RarityBadge rarity={ach.rarity} />
          <span>{ach.points} 分</span>
          <span className="ach-cat">{ach.category}</span>
        </div>
        {unlocked && story && <p className="ach-story">📖 {story}</p>}
      </div>
      {!unlocked && onUnlock && <button onClick={onUnlock}>解锁</button>}
    </div>
  );
}
```

- [ ] **Step 4: RarityBadge**

```jsx
// client/src/components/RarityBadge.jsx
const colors = { '普通':'#95a5a6', '稀有':'#3498db', '史诗':'#9b59b6', '传说':'#f39c12' };
export default function RarityBadge({ rarity }) {
  return <span className="rarity-badge" style={{ background: colors[rarity] || '#95a5a6' }}>{rarity}</span>;
}
```

---

### Task 6: 前端页面

**Files:**
- Create: `client/src/pages/` 下 7 个页面文件

- [ ] **Step 1: Home.jsx — 首页**

大标题 + 简介 + 快捷入口按钮（进入百科 / 查看排行榜 / 开始游戏）

- [ ] **Step 2: Login.jsx / Register.jsx**

表单 → 调用 `/api/auth/login` 或 `/register` → 存 token + user → 跳转 profile

- [ ] **Step 3: Profile.jsx — 个人主页**

调用 `/api/users/me` → 展示等级/点数/已解锁成就墙。成就网格布局，未解锁灰暗 + 🔒

- [ ] **Step 4: Library.jsx — 成就百科**

调用 `/api/achievements` → 卡片网格。顶部筛选栏：分类下拉 + 稀有度多选。显示全 25 个预置成就

- [ ] **Step 5: Generator.jsx — AI 生成器**

输入框 → 点"生成成就" → 调用 `/api/achievements/generate` → 显示生成的成就卡 + 自动解锁

- [ ] **Step 6: Leaderboard.jsx — 排行榜**

调用 `/api/leaderboard` → 排名表格，前三名高亮。显示排名/用户名/点数/等级

---

### Task 7: 样式与收尾

**Files:**
- Modify: `client/src/App.css`

**风格定位:** 暗色游戏风 + Neon 辉光，成就卡像游戏物品卡牌 🎴

每个页面独立样式块，动画过渡，暗色背景 `#0a0a1a`，文字 `#e0e0e0`。成就卡带稀有度颜色边框辉光。

---

### Task 8: 种子数据导入 + 最终验证

- [ ] 导入种子成就到数据库
- [ ] 启动后端 `node server/index.js`
- [ ] 启动前端 `cd client && npm run dev`
- [ ] 验证：注册 → 登录 → 浏览百科 → 解锁成就 → AI生成 → 查看排行榜
