const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'earth-online-secret-2026';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '请先登录' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Token已过期，请重新登录' }); }
}
module.exports = { auth, SECRET };
