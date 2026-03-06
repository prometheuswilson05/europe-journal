import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function EntryForm({ onSaved }: { onSaved: () => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [author, setAuthor] = useState<'Victor' | 'Trang'>('Victor')
  const [high, setHigh] = useState('')
  const [low, setLow] = useState('')
  const [memory, setMemory] = useState('')
  const [bestMeal, setBestMeal] = useState('')
  const [locationName, setLocationName] = useState('')
  const [khaiMoment, setKhaiMoment] = useState('')
  const [wouldReturn, setWouldReturn] = useState<'' | 'yes' | 'no' | 'maybe'>('')
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const media_urls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${date}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file)

      if (uploadError) {
        setMessage('Upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      media_urls.push(data.publicUrl)
    }

    const { error } = await supabase.from('entries').upsert(
      {
        entry_date: date,
        author,
        high,
        low,
        memory,
        media_urls,
        best_meal: bestMeal || null,
        location_name: locationName || null,
        khai_moment: khaiMoment || null,
        would_return: wouldReturn || null,
      },
      { onConflict: 'entry_date' }
    )

    if (error) {
      setMessage('Save failed: ' + error.message)
    } else {
      setMessage('Saved!')
      setHigh('')
      setLow('')
      setMemory('')
      setBestMeal('')
      setLocationName('')
      setKhaiMoment('')
      setWouldReturn('')
      setFiles([])
      if (fileRef.current) fileRef.current.value = ''
      onSaved()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <h2>New Entry</h2>

      <div className="author-toggle">
        <button
          type="button"
          className={author === 'Victor' ? 'active' : ''}
          onClick={() => setAuthor('Victor')}
        >
          Victor
        </button>
        <button
          type="button"
          className={author === 'Trang' ? 'active' : ''}
          onClick={() => setAuthor('Trang')}
        >
          Trang
        </button>
      </div>

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

      <div className="section-divider">Optional</div>

      <label>
        Best meal of the day 🍽️
        <textarea value={bestMeal} onChange={e => setBestMeal(e.target.value)} rows={2} placeholder="What did you eat?" />
      </label>

      <label>
        Where we were 📍
        <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="City, landmark, neighborhood..." />
      </label>

      <label>
        Something Khai did 👦
        <textarea value={khaiMoment} onChange={e => setKhaiMoment(e.target.value)} rows={2} placeholder="Funny, sweet, memorable..." />
      </label>

      <label>
        Would we come back? 🔄
        <div className="toggle-group">
          {(['yes', 'no', 'maybe'] as const).map(opt => (
            <button
              key={opt}
              type="button"
              className={wouldReturn === opt ? 'active' : ''}
              onClick={() => setWouldReturn(wouldReturn === opt ? '' : opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </label>

      <label>
        Photos & videos
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/mov"
          multiple
          onChange={e => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && <span className="file-count">{files.length} file{files.length > 1 ? 's' : ''} selected</span>}
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Entry'}
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  )
}
