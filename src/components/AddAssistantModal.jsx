import React, { useEffect, useState } from 'react'

export default function AddAssistantModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [url, setUrl] = useState(initial?.webhookUrl || '')
  const [error, setError] = useState('')

  useEffect(()=>{
    setName(initial?.name||'')
    setUrl(initial?.webhookUrl||'')
    setError('')
  }, [initial, open])

  if(!open) return null

  const validateUrl = (value) => {
    try {
      const u = new URL(value)
      return ['http:', 'https:'].includes(u.protocol)
    } catch {
      return false
    }
  }

  const handleSave = () => {
    if(!name.trim()) return setError('Name required')
    if(!validateUrl(url)) return setError('Enter a valid URL')
    onSave({ name: name.trim(), webhookUrl: url.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70">
      <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900/90 backdrop-blur-md text-zinc-100">
        <div className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{initial? 'Edit Assistant' : 'Add Assistant'}</div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl bg-zinc-800/60 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="My Assistant" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Webhook URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} className="w-full rounded-xl bg-zinc-800/60 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60">Cancel</button>
            <button onClick={handleSave} className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
