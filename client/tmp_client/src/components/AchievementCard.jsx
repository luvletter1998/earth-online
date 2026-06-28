const colors = { '普通': '#7f8c8d', '稀有': '#3498db', '史诗': '#9b59b6', '传说': '#f39c12' }
const glow = { '普通': 'none', '稀有': '0 0 8px rgba(52,152,219,0.3)', '史诗': '0 0 12px rgba(155,89,182,0.4)', '传说': '0 0 20px rgba(243,156,18,0.5)' }
export default function AchievementCard({ ach, unlocked, story, onUnlock }) {
  const c = colors[ach.rarity] || '#7f8c8d'
  return (
    <div className={`ach-card ${unlocked ? 'unlocked' : 'locked'}`} style={{ borderColor: c, boxShadow: unlocked ? glow[ach.rarity] : 'none' }}>
      <div className="ach-icon">{unlocked ? ach.icon : '🔒'}</div>
      <div className="ach-info">
        <h3 style={{ color: unlocked ? '#e0e0e0' : '#555' }}>{unlocked ? ach.title : '???'}</h3>
        {unlocked && <p className="ach-desc">{ach.description}</p>}
        <div className="ach-meta">
          <span className="rarity-badge" style={{ background: c }}>{ach.rarity}</span>
          <span className="ach-pts">{ach.points}分</span>
          <span className="ach-cat">#{ach.category}</span>
        </div>
        {unlocked && story && <p className="ach-story">📖 {story}</p>}
      </div>
      {!unlocked && onUnlock && <button className="btn-unlock" onClick={onUnlock}>🔓 解锁</button>}
    </div>
  )
}
