import { useState } from 'react'
import { api } from '../api'
import AchievementCard from '../components/AchievementCard'

export default function Generator() {
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const generate = async () => {
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await api('/achievements/generate', { method:'POST', body:JSON.stringify({story}) })
      setResult(r.achievement)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="generator-page">
      <h2 className="page-title">✨ AI 成就生成器</h2>
      <p className="gen-desc">写下你的一段经历，AI 为你生成专属成就卡。</p>
      <div className="gen-input-area">
        <textarea
          value={story} onChange={e=>setStory(e.target.value)}
          placeholder="比如：今天早上6点起床跑了5公里，然后喝了一杯自己做的拿铁，上班路上还帮一位老奶奶指路..."
          rows={4}
        />
        <button onClick={generate} disabled={loading || story.length < 5} className="btn-primary">
          {loading ? '🎲 AI 生成中...' : '🎲 生成成就'}
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {result && (
        <div className="gen-result">
          <h3>🎉 成就已解锁！</h3>
          <AchievementCard ach={result} unlocked={true} story={story} />
          <p className="gen-hint">已自动保存到你的个人主页，+{result.points} 成就点</p>
        </div>
      )}
    </div>
  )
}
