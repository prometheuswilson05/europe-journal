import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Entry {
  id: string
  entry_date: string
  high: string
  low: string
  memory: string
  photo_url: string | null
  created_at: string
}

export default function EntryFeed({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data)
      })
  }, [refreshKey])

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="feed">
      <h2>Past Entries</h2>
      {entries.length === 0 && <p className="empty">No entries yet. Start journaling!</p>}
      {entries.map(entry => (
        <div key={entry.id} className="card">
          <h3>{formatDate(entry.entry_date)}</h3>
          <div className="card-section">
            <span className="label">High</span>
            <p>{entry.high}</p>
          </div>
          <div className="card-section">
            <span className="label">Low</span>
            <p>{entry.low}</p>
          </div>
          <div className="card-section">
            <span className="label">Memory</span>
            <p>{entry.memory}</p>
          </div>
          {entry.photo_url && (
            <img
              src={entry.photo_url}
              alt="Journal photo"
              className={`photo-thumb ${expandedPhoto === entry.id ? 'expanded' : ''}`}
              onClick={() => setExpandedPhoto(expandedPhoto === entry.id ? null : entry.id)}
            />
          )}
        </div>
      ))}

      {expandedPhoto && (
        <div className="lightbox" onClick={() => setExpandedPhoto(null)}>
          <img
            src={entries.find(e => e.id === expandedPhoto)?.photo_url ?? ''}
            alt="Full size"
          />
        </div>
      )}
    </div>
  )
}
