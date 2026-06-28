import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
export default function Register() {
  const [username, setUser] = useState(''); const [password, setPass] = useState('')
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const submit = async (e) => { e.preventDefault(); setError(''); setLoading(true)
    try { const data = await api('/auth/register', { method:'POST', body:JSON.stringify({username,password}) })
      localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user))
      nav('/profile') } catch(e) { setError(e.message) } finally { setLoading(false) } }
  return (
    <div className="auth-page">
      <form onSubmit={submit} className="auth-form">
        <h2>🎮 创建角色</h2>
        {error && <div className="error-msg">{error}</div>}
        <input value={username} onChange={e=>setUser(e.target.value)} placeholder="用户名（游戏ID）" required />
        <input value={password} onChange={e=>setPass(e.target.value)} type="password" placeholder="密码" required />
        <button type="submit" className="btn-primary" disabled={loading}>{loading?'创建中...':'开始游戏'}</button>
        <p className="auth-switch">已有账号？<Link to="/login">立即登录</Link></p>
      </form>
    </div>
  )
}
