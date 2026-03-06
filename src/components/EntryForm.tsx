import { useState, useRef, useEffect } from 'react'
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
}

interface Props {
  onSaved: () => void
  editEntry?: Entry | null
  onCancelEdit?: () => void
}

function isVideo(url: string) {
  return /\.(mp4|mov|quicktime)$/i.test(url) || url.includes('.mov') || url.includes('.mp4')
}

export default function EntryForm({ onSaved, editEntry, onCancelEdit }: Props) {
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
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = !!editEntry

  useEffect(() => {
    if (editEntry) {
      setDate(editEntry.entry_date)
      setAuthor(editEntry.author as 'Victor' | 'Trang')
      setHigh(editEntry.high)
      setLow(editEntry.low)
      setMemory(editEntry.memory)
      setBestMeal(editEntry.best_meal ?? '')
      setLocationName(editEntry.location_name ?? '')
      setKhaiMoment(editEntry.khai_moment ?? '')
      setWouldReturn((editEntry.would_return as '' | 'yes' | 'no' | 'maybe') ?? '')
      setExistingUrls(editEntry.media_urls ?? [])
      setNewFiles([])
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [editEntry])

  function reset() {
    setDate(today)
    setAuthor('Victor')
    setHigh('')
    setLow('')
    setMemory('')
    setBestMeal('')
    setLocationName('')
    setKhaiMoment('')
    setWouldReturn('')
    setExistingUrls([])
    setNewFiles([])
    if (fileRef.current) fileRef.current.value = ''
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const uploadedUrls: string[] = []

    for (const file of newFiles) {
      const ext = file.name.split('.').pop()
      const path = `${date}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, file)
      if (uploadError) {
        setMessage('Upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      uploadedUrls.push(data.publicUrl)
    }

    const media_urls = [...existingUrls, ...uploadedUrls]

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
      setMessage(isEditing ? 'Updated!' : 'Saved!')
      reset()
      onSaved()
      if (onCancelEdit) onCancelEdit()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <h2>{isEditing ? `Editing ${date}` : 'New Entry'}</h2>

      <div className="author-toggle">
        {(['Victor', 'Trang'] as const).map(name => (
          <button key={name} type="button" className={author === name ? 'active' : ''} onClick={() => setAuthor(name)}>{name}</button>
        ))}
      </div>

      <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
      <label>High of the day<textarea value={high} onChange={e => setHigh(e.target.value)} required rows={3} placeholder="What was the best part?" /></label>
      <label>Low of the day<textarea value={low} onChange={e => setLow(e.target.value)} required rows={3} placeholder="What was the tough part?" /></label>
      <label>Random memory<textarea value={memory} onChange={e => setMemory(e.target.value)} required rows={3} placeholder="Something you want to remember..." /></label>

      <div className="section-divider">Optional</div>

      <label>Best meal of the day 🍽️<textarea value={bestMeal} onChange={e => setBestMeal(e.target.value)} rows={2} placeholder="What did you eat?" /></label>
      <label>Where we were 📍<input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="City, landmark, neighborhood..." /></label>
      <label>Something Khai did 👦<textarea value={khaiMoment} onChange={e => setKhaiMoment(e.target.value)} rows={2} placeholder="Funny, sweet, memorable..." /></label>

      <label>Would we come back? 🔄
        <div className="toggle-group">
          {(['yes', 'no', 'maybe'] as const).map(opt => (
            <button key={opt} type="button" className={wouldReturn === opt ? 'active' : ''} onClick={() => setWouldReturn(wouldReturn === opt ? '' : opt)}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </label>

      <label>Photos & videos</label>

      {existingUrls.length > 0 && (
        <div className="existing-media">
          <p className="existing-label">Current media — tap × to remove</p>
          <div className="media-strip">
            {existingUrls.map((url, i) => (
              <div key={i} className="media-thumb-wrap">
                {isVideo(url) ? <video src={url} className="media-thumb" /> : <img src={url} alt="media" className="media-thumb" />}
                <button type="button" className="remove-media" onClick={() => setExistingUrls(prev => prev.filter(u => u !== url))}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,video/mp4,video/quicktime,video/mov" multiple onChange={e => setNewFiles(Array.from(e.target.files ?? []))} />
      {newFiles.length > 0 && <span className="file-count">{newFiles.length} new file{newFiles.length > 1 ? 's' : ''} selected</span>}

      <div className="form-actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}</button>
        {isEditing && <button type="button" className="cancel-btn" onClick={() => { reset(); onCancelEdit?.() }}>Cancel</button>}
      </div>

      {message && <p className="message">{message}</p>}
    </form>
  )
}
