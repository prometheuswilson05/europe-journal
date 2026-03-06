import { useState } from 'react'
import EntryForm from './components/EntryForm'
import EntryFeed from './components/EntryFeed'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Europe Journal</h1>
        <p className="subtitle">Victor's daily travel log</p>
      </header>
      <main>
        <EntryForm onSaved={() => setRefreshKey(k => k + 1)} />
        <EntryFeed refreshKey={refreshKey} />
      </main>
    </div>
  )
}
