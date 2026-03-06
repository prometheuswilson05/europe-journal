import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Entry {
  id: string
  entry_date: string
  author: string
  high: string
  low: string
  memory: string
  media_urls: string[]
  best_meal: string | null
  location_name: string | null
  khai_moment: string | null
  would_return: string | null
  created_at: string
}

function isVideo(url: string) {
  return /\.(mp4|mov|quicktime)$/i.test(url) || url.includes('.mov') || url.includes('.mp4')
}

export default function EntryFeed({ refreshKey, onEdit }: { refreshKey: number; onEdit: (entry: Entry) => void }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('entries').select('*').order('entry_date', { ascending: false })
      .then(({ data }) => { if (data) setEntries(data) })
  }, [refreshKey])

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const returnLabel: Record<string, string> = { yes: 'Yes!', no: 'No', maybe: 'Maybe' }

  return (
    <div className="feed">
      <h2>Past Entries</h2>
      {entries.length === 0 && <p className="empty">No entries yet. Start journaling!</p>}
      {entries.map(entry => (
        <div key={entry.id} className="card">
          <div className="card-header">
            <h3>{formatDate(entry.entry_date)}</h3>
            <div className="card-header-right">
              <span className="author-badge">{entry.author}</span>
              <button className="edit-btn" onClick={() => onEdit(entry)}>Edit</button>
            </div>
          </div>
          {entry.location_name && <div className="card-location">📍 {entry.location_name}</div>}
          <div className="card-section"><span className="label">High</span><p>{entry.high}</p></div>
          <div className="card-section"><span className="label">Low</span><p>{entry.low}</p></div>
          <div className="card-section"><span className="label">Memory</span><p>{entry.memory}</p></div>
          {entry.best_meal && <div className="card-section"><span className="label">🍽️ Best meal</span><p>{entry.best_meal}</p></div>}
          {entry.khai_moment && <div className="card-section"><span className="label">👦 Khai</span><p>{entry.khai_moment}</p></div>}
          {entry.would_return && <div className="card-section"><span className="label">🔄 Come back?</span><p>{returnLabel[entry.would_return] ?? entry.would_return}</p></div>}
          {entry.media_urls?.length > 0 && (
            <div className="media-strip">
              {entry.media_urls.map((url, i) =>
                isVideo(url)
                  ? <video key={i} src={url} controls playsInline className="media-thumb" />
                  : <img key={i} src={url} alt="Journal media" className="media-thumb" onClick={() => setLightboxUrl(url)} />
              )}
            </div>
          )}
        </div>
      ))}
      {lightboxUrl && (
        <div className="lightbox" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Full size" />
        </div>
      )}
    </div>
  )
}
