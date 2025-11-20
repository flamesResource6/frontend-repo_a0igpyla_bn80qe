import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Image as ImageIcon, Link as LinkIcon, Trash2, Upload } from 'lucide-react'

const sanitize = (text='') => text.replace(/[<>]/g, '')

function Message({ m }) {
  return (
    <div className={`max-w-3xl ${m.role==='user'? 'self-end' : 'self-start'} `}>
      <div className={`rounded-2xl px-4 py-3 mb-3 whitespace-pre-wrap leading-relaxed ${m.role==='user'? 'bg-zinc-800/60 text-zinc-100' : 'bg-zinc-900/60 text-zinc-200'}`}>
        {m.content && <div className="text-sm">{sanitize(m.content)}</div>}
        {m.images?.length>0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {m.images.map((src,i)=> (
              <img key={i} src={src} alt="image" className="rounded-xl" />
            ))}
          </div>
        )}
        {m.links?.length>0 && (
          <div className="mt-2 space-y-1">
            {m.links.map((l,i)=> (
              <a key={i} href={l} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-300 hover:underline"><LinkIcon size={14}/>{l}</a>
            ))}
          </div>
        )}
        {m.attachments?.length>0 && (
          <div className="mt-2 text-xs text-zinc-400">Attachments: {m.attachments.length}</div>
        )}
      </div>
    </div>
  )
}

export default function ChatArea({ activeAssistant, onBackup }){
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const viewRef = useRef(null)

  // Load/save per assistant messages from localStorage
  useEffect(()=>{
    if(!activeAssistant) return
    const key = `conv:${activeAssistant.id}`
    const raw = localStorage.getItem(key)
    setMessages(raw? JSON.parse(raw): [])
  }, [activeAssistant?.id])

  useEffect(()=>{
    if(!activeAssistant) return
    const key = `conv:${activeAssistant.id}`
    localStorage.setItem(key, JSON.stringify(messages))
  }, [messages, activeAssistant?.id])

  useEffect(()=>{
    viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const parseWebhookResponse = (data) => {
    // Expected: array of objects with { output?, image?, b64_json? links? attachments? }
    let outputs = []
    try {
      if(Array.isArray(data)) outputs = data
      else if(Array.isArray(data?.data)) outputs = data.data
      else outputs = [data]
    } catch { outputs = [] }

    const built = outputs.map(item => {
      const content = item.output || item.text || ''
      const images = []
      if(item.image) images.push(item.image)
      if(item.images && Array.isArray(item.images)) images.push(...item.images)
      if(item.b64_json){
        images.push(`data:image/png;base64,${item.b64_json}`)
      }
      const links = []
      if(item.links && Array.isArray(item.links)) links.push(...item.links)
      if(item.url) links.push(item.url)
      return { role: 'assistant', content, images, links, attachments: item.attachments||[] }
    })
    return built
  }

  const sendMessage = async () => {
    if(!activeAssistant || !input.trim()) return
    const userMsg = { role:'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const controller = new AbortController()
      const id = setTimeout(()=> controller.abort(), 20000)
      const res = await fetch(activeAssistant.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
        signal: controller.signal
      })
      clearTimeout(id)
      if(!res.ok){
        throw new Error(`Request failed: ${res.status}`)
      }
      const data = await res.json()
      const built = parseWebhookResponse(data)
      if(built.length===0) {
        setMessages(m=> [...m, { role:'assistant', content: 'No content in webhook response.' }])
      } else {
        setMessages(m => [...m, ...built])
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = () => {
    if(!activeAssistant) return
    setMessages([])
  }

  const importBackup = (json) => {
    if(!activeAssistant) return
    try {
      const parsed = JSON.parse(json)
      if(Array.isArray(parsed)){
        setMessages(parsed)
      }
    } catch {}
  }

  const exportConversation = () => {
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${activeAssistant?.name||'assistant'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div ref={viewRef} className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((m, i)=> <Message key={i} m={m} />)}
        {loading && (
          <div className="inline-flex items-center gap-2 text-zinc-400 text-sm"><Loader2 className="animate-spin" size={16}/> Waiting for assistant...</div>
        )}
      </div>

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-zinc-900/70 p-2">
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={3} placeholder="Type your message..." className="w-full bg-transparent resize-none outline-none text-zinc-100 placeholder:text-zinc-500 px-3 py-2" />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="text-xs text-zinc-500">Press Enter to send • Shift+Enter for new line</div>
              <div className="flex items-center gap-2">
                <button onClick={clearConversation} className="text-xs px-3 py-1 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 inline-flex items-center gap-2"><Trash2 size={14}/> Clear</button>
                <button onClick={exportConversation} className="text-xs px-3 py-1 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60">Export</button>
                <button onClick={sendMessage} className="text-xs px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
