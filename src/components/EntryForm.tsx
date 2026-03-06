import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EntryForm({ onSaved }: { onSaved: () => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [high, setHigh] = useState('')
  const [low, setLow] = useState('')
  const [memory, setMemory] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let photo_url: string | null = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${date}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, photo)

      if (uploadError) {
        setMessage('Photo upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      photo_url = data.publicUrl
    }

    const { error } = await supabase.from('entries').upsert(
      { entry_date: date, high, low, memory, photo_url },
      { onConflict: 'entry_date' }
    )

    if (error) {
      setMessage('Save failed: ' + error.message)
    } else {
      setMessage('Saved!')
      setHigh('')
      setLow('')
      setMemory('')
      setPhoto(null)
      onSaved()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <h2>New Entry</h2>

      <label>
        Date
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>

      <label>
        High of the day
        <textarea value={high} onChange={e => setHigh(e.target.value)} required rows={3} placeholder="What was the best part?" />
      </label>

      <label>
        Low of the day
        <textarea value={low} onChange={e => setLow(e.target.value)} required rows={3} placeholder="What was the tough part?" />
      </label>

      <label>
        Random memory
        <textarea value={memory} onChange={e => setMemory(e.target.value)} required rows={3} placeholder="Something you want to remember..." />
      </label>

      <label>
        Photo (optional)
        <input
          type="file"
          accept="image/*"
          onChange={e => setPhoto(e.target.files?.[0] ?? null)}
        />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Entry'}
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  )
}
