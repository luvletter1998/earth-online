# 地球Online — 成就系统 设计规格

## 概述
一个以"人生如游戏"为主题的成就系统网站。用户注册后可解锁/浏览成就，生成专属成就卡并分享。

## 技术栈
- 前端：React + Vite + React Router
- 后端：Node.js + Express + Knex.js
- 数据库：PostgreSQL
- 认证：JWT (jsonwebtoken + bcrypt)
- AI生成：SiliconFlow API（已有 Key）

## 功能模块

### 1. 用户系统
- 注册：用户名 + 密码
- 登录：返回 JWT Token
- 个人资料：头像、等级、成就点数

### 2. 成就百科（Achievement Library）
- 全成就列表，按分类筛选
- 分类：生存 / 社交 / 职场 / 宅家 / 奇葩
- 稀有度：普通 / 稀有 / 史诗 / 传说
- 每个成就显示：图标、标题、描述、条件、点数

### 3. 个人主页（Profile）
- 已解锁成就墙（高亮）+ 未解锁（灰暗）
- 成就进度条、总点数、等级
- 最近解锁时间线

### 4. 成就生成器（Generator）
- 用户输入一段经历/故事
- 调用 AI 生成专属成就（标题 + 描述 + 图标 + 稀有度）
- 可保存到个人成就列表

### 5. 排行榜
- 按成就点数排名
- 显示头像、用户名、点数、成就数

## 页面路由
```
/           首页（介绍 + 跳转）
/register   注册
/login      登录
/profile    个人主页
/library    成就百科
/generator  成就生成器
/leaderboard 排行榜
```

## 数据库表
```sql
users: id, username, password_hash, avatar_url, level, points, created_at
achievements: id, category, title, description, icon, points, rarity, unlock_condition, created_at
user_achievements: id, user_id, achievement_id, unlocked_at, story, is_custom
```

## 预置成就（至少 20 个）
覆盖5个分类，4种稀有度，有趣接地气。
