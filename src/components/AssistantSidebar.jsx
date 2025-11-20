import React from 'react'
import { Plus, Edit2, Trash2, Download, Upload } from 'lucide-react'

export default function AssistantSidebar({ assistants, activeId, onSelect, onAdd, onEdit, onDelete, onExport, onImport }) {
  return (
    <aside className="w-72 shrink-0 h-full p-4 text-zinc-200 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm uppercase tracking-wider text-zinc-400">Assistants</span>
        <button onClick={onAdd} className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-zinc-800/60 hover:bg-zinc-700/60 transition">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {assistants.map(a => (
          <div key={a.id} className={`group px-3 py-3 rounded-xl cursor-pointer transition ${a.id===activeId? 'bg-zinc-800/60' : 'hover:bg-zinc-800/40'}`}
               onClick={() => onSelect(a.id)}>
            <div className="flex items-center justify-between">
              <div className="truncate text-sm text-zinc-100">{a.name}</div>
              <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                <button onClick={(e)=>{e.stopPropagation(); onEdit(a)}} className="p-1 rounded-md hover:bg-zinc-700/60"><Edit2 size={16}/></button>
                <button onClick={(e)=>{e.stopPropagation(); onDelete(a.id)}} className="p-1 rounded-md hover:bg-zinc-700/60"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="text-xs text-zinc-500 truncate">{a.webhookUrl}</div>
          </div>
        ))}
        {assistants.length===0 && (
          <div className="text-zinc-500 text-sm">No assistants yet. Add one.</div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button onClick={onExport} className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 transition">
          <Download size={16}/> Export
        </button>
        <button onClick={onImport} className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 transition">
          <Upload size={16}/> Import
        </button>
      </div>
    </aside>
  )
}
