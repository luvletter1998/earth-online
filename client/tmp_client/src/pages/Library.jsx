import { useState, useEffect } from 'react'
import { api } from '../api'
import AchievementCard from '../components/AchievementCard'

const CATS = ['全部', '生存', '社交', '职场', '宅家', '奇葩']
const RARITIES = ['全部', '普通', '稀有', '史诗', '传说']

export default function Library() {
  const [achs, setAchs] = useState([])
  const [cat, setCat] = useState('全部')
  const [rarity, setRarity] = useState('全部')

  useEffect(() => {
    const params = new URLSearchParams()
    if (cat !== '全部') params.set('category', cat)
    if (rarity !== '全部') params.set('rarity', rarity)
    api(`/achievements?${params}`).then(setAchs).catch(() => {})
  }, [cat, rarity])

  return (
    <div className="library-page">
      <h2 className="page-title">📚 成就百科</h2>
      <div className="filters">
        <div className="filter-group">
          <span>分类：</span>
          {CATS.map(c => <button key={c} className={`filter-btn ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</button>)}
        </div>
        <div className="filter-group">
          <span>稀有度：</span>
          {RARITIES.map(r => <button key={r} className={`filter-btn ${rarity===r?'active':''}`} onClick={()=>setRarity(r)}>{r}</button>)}
        </div>
      </div>
      <div className="ach-grid">
        {achs.map(a => <AchievementCard key={a.id} ach={a} unlocked={false} />)}
      </div>
    </div>
  )
}
