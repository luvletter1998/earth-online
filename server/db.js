// Using a simple JSON file database - no native compilation needed
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data.json');

let data = { users: [], achievements: [], user_achievements: [] };

// Load existing data
try { data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
catch { save(); }

function save() { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

const db = {
  // Users
  async findUser(username) { return data.users.find(u => u.username === username) || null; },
  async createUser(user) {
    const u = { id: data.users.length + 1, ...user, level: 1, points: 0, created_at: new Date().toISOString() };
    data.users.push(u); save(); return u;
  },
  async getUser(id) { return data.users.find(u => u.id === id) || null; },
  async updateUser(id, updates) {
    const idx = data.users.findIndex(u => u.id === id);
    if (idx >= 0) { Object.assign(data.users[idx], updates); save(); }
  },

  // Achievements
  async getAchievements(category, rarity) {
    let list = data.achievements;
    if (category) list = list.filter(a => a.category === category);
    if (rarity) list = list.filter(a => a.rarity === rarity);
    return list.sort((a, b) => b.points - a.points);
  },
  async getAchievement(id) { return data.achievements.find(a => a.id === id) || null; },
  async createAchievement(ach) {
    const a = { id: data.achievements.length + 1, ...ach, created_at: new Date().toISOString() };
    data.achievements.push(a); save(); return a;
  },
  async getAchievementCount() { return data.achievements.length; },

  // User Achievements
  async findUserAchievement(userId, achId) {
    return data.user_achievements.find(ua => ua.user_id === userId && ua.achievement_id === achId) || null;
  },
  async addUserAchievement(ua) {
    data.user_achievements.push({ id: data.user_achievements.length + 1, ...ua, unlocked_at: new Date().toISOString() });
    save();
  },
  async getUserAchievements(userId) {
    return data.user_achievements
      .filter(ua => ua.user_id === userId)
      .map(ua => {
        const ach = data.achievements.find(a => a.id === ua.achievement_id);
        return ach ? { ...ach, unlocked_at: ua.unlocked_at, story: ua.story, is_custom: ua.is_custom } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at));
  },

  // Leaderboard
  async getLeaderboard() {
    return data.users
      .map(u => ({ id: u.id, username: u.username, points: u.points, level: u.level }))
      .sort((a, b) => b.points - a.points).slice(0, 50);
  }
};

// Seed achievements if empty
if (data.achievements.length === 0) {
  data.achievements = require('./seeds/achievements').map((a, i) => ({ id: i + 1, ...a }));
  save();
  console.log('Seeded ' + data.achievements.length + ' achievements');
}

module.exports = db;
