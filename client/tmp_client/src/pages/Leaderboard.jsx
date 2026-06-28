import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Leaderboard() {
  const [list, setList] = useState([])
  useEffect(() => { api('/leaderboard').then(setList).catch(()=>{}) }, [])

  const medals = ['🥇','🥈','🥉']
  return (
    <div className="leaderboard-page">
      <h2 className="page-title">🏆 排行榜</h2>
      <div className="lb-table-wrap">
        <table className="lb-table">
          <thead><tr><th>排名</th><th>玩家</th><th>等级</th><th>成就点</th></tr></thead>
          <tbody>
            {list.map((u, i) => (
              <tr key={u.id} className={i < 3 ? `top-${i+1}` : ''}>
                <td className="lb-rank">{i < 3 ? medals[i] : i+1}</td>
                <td className="lb-name">{u.username}</td>
                <td>Lv.{Math.floor(u.points/100)+1}</td>
                <td className="lb-pts">{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
