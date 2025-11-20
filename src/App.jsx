import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import SplineBackground from './components/SplineBackground'
import AssistantSidebar from './components/AssistantSidebar'
import AddAssistantModal from './components/AddAssistantModal'
import ChatArea from './components/ChatArea'

const uid = () => crypto.randomUUID()

const LS_KEY = 'ai-assistant-manager-v1'

export default function App(){
  const [assistants, setAssistants] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editAssistant, setEditAssistant] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const fileRef = useRef(null)

  // load from localStorage
  useEffect(()=>{
    const raw = localStorage.getItem(LS_KEY)
    if(raw){
      try {
        const data = JSON.parse(raw)
        setAssistants(data.assistants||[])
        setActiveId(data.assistants?.[0]?.id || null)
      } catch {}
    }
  }, [])

  // persist assistants
  useEffect(()=>{
    const data = { assistants, settings: {}, backups: [] }
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }, [assistants])

  const activeAssistant = useMemo(()=> assistants.find(a=>a.id===activeId) || assistants[0], [assistants, activeId])

  const openAdd = () => { setEditAssistant(null); setShowModal(true) }
  const openEdit = (a) => { setEditAssistant(a); setShowModal(true) }

  const handleSave = (payload) => {
    if(editAssistant){
      setAssistants(list => list.map(a => a.id===editAssistant.id? { ...a, ...payload } : a))
    } else {
      const a = { id: uid(), name: payload.name, webhookUrl: payload.webhookUrl, conversations: [] }
      setAssistants(list => [a, ...list])
      setActiveId(a.id)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setAssistants(list => list.filter(a => a.id!==id))
    if(activeId===id){ setActiveId(null) }
  }

  const exportBackup = () => {
    const data = {
      assistants,
      settings: {},
      backups: [],
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assistant-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = () => {
    fileRef.current?.click()
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if(Array.isArray(data.assistants)){
          setAssistants(data.assistants)
          setActiveId(data.assistants?.[0]?.id || null)
        }
      } catch {}
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 relative">
      <SplineBackground />

      <div className="relative z-10 h-screen grid" style={{ gridTemplateColumns: sidebarOpen? '18rem 1fr' : '1fr' }}>
        {sidebarOpen && (
          <AssistantSidebar
            assistants={assistants}
            activeId={activeAssistant?.id}
            onSelect={setActiveId}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
            onExport={exportBackup}
            onImport={importBackup}
          />
        )}
        <main className="h-full flex flex-col">
          <header className="p-4 flex items-center justify-between">
            <button className="rounded-xl bg-zinc-900/60 p-2" onClick={()=>setSidebarOpen(s=>!s)}><Menu size={18}/></button>
            <div className="text-xs uppercase tracking-wider text-zinc-400">AI Assistant Manager</div>
            <div className="w-8" />
          </header>
          <section className="flex-1 h-0">
            {activeAssistant? (
              <ChatArea activeAssistant={activeAssistant} />
            ) : (
              <div className="h-full grid place-items-center text-zinc-400">
                Add your first assistant to start chatting.
              </div>
            )}
          </section>
        </main>
      </div>

      <input type="file" accept="application/json" ref={fileRef} onChange={onFile} className="hidden" />
      <AddAssistantModal open={showModal} onClose={()=>setShowModal(false)} onSave={handleSave} initial={editAssistant} />
    </div>
  )
}
