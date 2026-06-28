const BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://REPLACE_WITH_RENDER_URL.onrender.com/api';

const token = () => localStorage.getItem('token');

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const t = token(); if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}
