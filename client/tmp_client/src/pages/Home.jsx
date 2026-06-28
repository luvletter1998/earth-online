import { Link } from 'react-router-dom'
export default function Home() {
  const token = localStorage.getItem('token')
  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">🌍 地球 Online</h1>
        <p className="hero-subtitle">你的人生，就是一场开放世界 MMO 游戏</p>
        <p className="hero-desc">每一个平凡的日常，都藏着值得纪念的成就。<br />解锁属于你的传奇勋章。</p>
        <div className="hero-buttons">
          <Link to="/library" className="btn-primary">📚 浏览成就百科</Link>
          <Link to="/leaderboard" className="btn-secondary">🏆 查看排行榜</Link>
          {!token && <Link to="/register" className="btn-accent">🎮 开始游戏</Link>}
          {token && <Link to="/profile" className="btn-accent">👤 我的主页</Link>}
        </div>
      </div>
      <div className="features">
        <div className="feature-card"><span className="f-icon">📚</span><h3>成就百科</h3><p>25+ 预设成就，覆盖生存/社交/职场/宅家/奇葩五大分类</p></div>
        <div className="feature-card"><span className="f-icon">✨</span><h3>AI 生成器</h3><p>输入你的经历，AI 为你生成专属成就卡</p></div>
        <div className="feature-card"><span className="f-icon">🏆</span><h3>排行榜</h3><p>和全站玩家比拼成就点数</p></div>
        <div className="feature-card"><span className="f-icon">🎴</span><h3>个人主页</h3><p>展示你的成就墙，分享到朋友圈</p></div>
      </div>
    </div>
  )
}
