import { useState, useRef } from 'react'
import EntryForm from './components/EntryForm'
import EntryFeed from './components/EntryFeed'

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
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  function handleEdit(entry: Entry) {
    setEditEntry(entry)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="app">
      <header>
        <h1>🌍 Europe Journal</h1>
        <p className="subtitle">Mar 2026 · Wilson Family</p>
      </header>
      <main>
        <div ref={formRef}>
          <EntryForm
            onSaved={() => setRefreshKey(k => k + 1)}
            editEntry={editEntry}
            onCancelEdit={() => setEditEntry(null)}
          />
        </div>
        <EntryFeed refreshKey={refreshKey} onEdit={handleEdit} />
      </main>
    </div>
  )
}
