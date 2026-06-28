import { Link, useNavigate } from 'react-router-dom'
export default function Navbar() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const nav = useNavigate()
  const logout = () => { localStorage.clear(); nav('/') }
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🌍 地球Online</Link>
      <div className="nav-links">
        <Link to="/library">📚 百科</Link>
        <Link to="/leaderboard">🏆 排行</Link>
        {token ? <>
          <Link to="/generator">✨ 生成</Link>
          <Link to="/profile">👤 {user.username}</Link>
          <button onClick={logout} className="btn-outline-sm">退出</button>
        </> : <>
          <Link to="/login">登录</Link>
          <Link to="/register">注册</Link>
        </>}
      </div>
    </nav>
  )
}
