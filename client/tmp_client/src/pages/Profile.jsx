import { useState, useEffect } from 'react'
import { api } from '../api'
import AchievementCard from '../components/AchievementCard'

export default function Profile() {
  const [data, setData] = useState(null)
  const [allAch, setAllAch] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    api('/users/me').then(setData).catch(e => setErr(e.message))
    api('/achievements').then(setAllAch).catch(() => {})
  }, [])

  const handleUnlock = async (aid) => {
    try { const r = await api(`/achievements/${aid}/unlock`, { method:'POST' })
      setData(prev => ({
        ...prev,
        user: { ...prev.user, points: prev.user.points + r.points_earned },
        achievements: [...prev.achievements, { ...r.achievement, story: '' }]
      }))
    } catch(e) { alert(e.message) }
  }

  if (err) return <div className="page-err">{err}</div>
  if (!data) return <div className="loading">加载中...</div>

  const { user, achievements } = data
  const unlockedIds = new Set(achievements.map(a => a.id))
  const level = Math.floor(user.points / 100) + 1

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">🎮</div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <div className="profile-stats">
            <span className="stat">Lv.{level}</span>
            <span className="stat">{user.points} 成就点</span>
            <span className="stat">{achievements.length} 个成就</span>
          </div>
        </div>
      </div>

      <h3 className="section-title">🏆 已解锁成就</h3>
      {achievements.length === 0 && <p className="empty-hint">还没有成就，去 <a href="/library">成就百科</a> 解锁几个吧！</p>}
      <div className="ach-grid">
        {achievements.map(a => <AchievementCard key={a.id} ach={a} unlocked={true} story={a.story} />)}
      </div>

      <h3 className="section-title">🔒 待解锁</h3>
      <div className="ach-grid">
        {allAch.filter(a => !unlockedIds.has(a.id)).map(a =>
          <AchievementCard key={a.id} ach={a} unlocked={false} onUnlock={() => handleUnlock(a.id)} />
        )}
      </div>
    </div>
  )
}
