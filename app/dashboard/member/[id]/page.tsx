'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient, type Task, type Profile } from '@/lib/supabase'

const TEAM_COLORS = [
  { color:'#7c3aed', bg:'#ede9fe' },
  { color:'#2563eb', bg:'#dbeafe' },
  { color:'#d97706', bg:'#fef3c7' },
  { color:'#16a34a', bg:'#dcfce7' },
  { color:'#dc2626', bg:'#fee2e2' },
  { color:'#0891b2', bg:'#cffafe' },
  { color:'#db2777', bg:'#fce7f3' },
  { color:'#65a30d', bg:'#ecfccb' },
]

interface Comment {
  id: string
  task_id: string
  profile_id: string
  content: string
  created_at: string
}

interface TaskFile {
  id: string
  task_id: string
  name: string
  url: string | null
  file_path: string | null
  type: string
  created_at: string
}

const PRI_COLORS: Record<string,string> = { alta:'#ef4444', media:'#f59e0b', baja:'#22c55e' }
const PRI_BG:     Record<string,string> = { alta:'#fee2e2', media:'#fef3c7', baja:'#dcfce7' }

function TaskPanel({ task, profile, color }: { task: Task; profile: Profile & { color:string; bg:string }; color: string }) {
  const supabase = createClient()
  const [open, setOpen]         = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [files, setFiles]       = useState<TaskFile[]>([])
  const [newComment, setNewComment] = useState('')
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const deadline = task.deadline
    ? new Date(task.deadline + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
    : null

  const isLate = task.deadline && new Date(task.deadline + 'T23:59:59') < new Date() && task.status !== 'listo'

  useEffect(() => {
    if (!open) return
    supabase.from('task_comments').select('*').eq('task_id', task.id).order('created_at').then(({ data }) => { if (data) setComments(data) })
    supabase.from('task_files').select('*').eq('task_id', task.id).order('created_at').then(({ data }) => { if (data) setFiles(data) })
  }, [open])

  async function markDone() {
    const now = new Date().toISOString()
    await supabase.from('tasks').update({ status:'listo', completed_at: now }).eq('id', task.id)
    window.location.reload()
  }

  async function markInProgress() {
    await supabase.from('tasks').update({ status:'en progreso' }).eq('id', task.id)
    window.location.reload()
  }

  async function sendComment() {
    if (!newComment.trim() || saving) return
    setSaving(true)
    const { data } = await supabase.from('task_comments').insert([{
      task_id: task.id, profile_id: profile.id, content: newComment.trim()
    }]).select().single()
    if (data) setComments(prev => [...prev, data])
    setNewComment('')
    setSaving(false)
  }

  async function addLink() {
    if (!linkUrl.trim()) return
    const name = linkName.trim() || linkUrl
    const { data } = await supabase.from('task_files').insert([{
      task_id: task.id, profile_id: profile.id, name, url: linkUrl.trim(), type: 'link'
    }]).select().single()
    if (data) setFiles(prev => [...prev, data])
    setLinkName(''); setLinkUrl(''); setShowLinkForm(false)
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${task.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('task-files').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('task-files').getPublicUrl(path)
      const { data } = await supabase.from('task_files').insert([{
        task_id: task.id, profile_id: profile.id, name: file.name, url: publicUrl, file_path: path, type: 'file'
      }]).select().single()
      if (data) setFiles(prev => [...prev, data])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const statusLabel: Record<string,string> = { pendiente:'Pendiente', 'en progreso':'En progreso', listo:'Completada' }
  const statusColor: Record<string,string> = { pendiente:'#94a3b8', 'en progreso':'#f59e0b', listo:'#22c55e' }
  const statusBg:    Record<string,string> = { pendiente:'#f1f5f9', 'en progreso':'#fef3c7', listo:'#dcfce7' }

  return (
    <div style={{ background:'#fff', border:`1.5px solid ${open ? color : '#e2e8f0'}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', transition:'all .15s' }}>
      {/* Header de la tarea */}
      <div
        onClick={() => setOpen(!open)}
        style={{ padding:'14px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
      >
        <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: PRI_COLORS[task.priority] || '#94a3b8' }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0f172a', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: task.status==='listo'?'line-through':'none', opacity: task.status==='listo'?0.6:1 }}>
            {task.name}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6, background: statusBg[task.status], color: statusColor[task.status] }}>
              {statusLabel[task.status]}
            </span>
            <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6, background: PRI_BG[task.priority], color: PRI_COLORS[task.priority] }}>
              {task.priority}
            </span>
            <span style={{ fontSize:11, fontWeight:600, color:'#64748b', background:'#f1f5f9', padding:'2px 8px', borderRadius:6 }}>
              {task.estimated_hrs}h
            </span>
            {deadline && (
              <span style={{ fontSize:11, color: isLate ? '#ef4444' : '#94a3b8', fontWeight: isLate ? 700 : 400 }}>
                {isLate ? '⚠️ Vencida: ' : '📅 '}{deadline}
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize:18, color: color, transition:'transform .2s', transform: open?'rotate(180deg)':'rotate(0deg)', flexShrink:0 }}>
          ↓
        </div>
      </div>

      {/* Panel expandido */}
      {open && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'16px' }}>

          {/* Acciones */}
          {task.status !== 'listo' && (
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {task.status === 'pendiente' && (
                <button onClick={markInProgress} className="btn-ghost" style={{ flex:1, padding:'8px', fontSize:12 }}>
                  ▶ Marcar en progreso
                </button>
              )}
              <button onClick={markDone} className="btn-primary" style={{ flex:1, padding:'8px', fontSize:12, width:'auto' }}>
                ✓ Marcar como completada
              </button>
            </div>
          )}
          {task.status === 'listo' && (
            <div style={{ background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#15803d', fontWeight:600 }}>
              ✅ Tarea completada
            </div>
          )}

          {/* Comentarios */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#64748b', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
              Notas y comentarios
            </div>

            {comments.length === 0 ? (
              <div style={{ fontSize:12, color:'#94a3b8', padding:'10px 0', fontStyle:'italic' }}>Sin comentarios aún.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:13, color:'#334155', lineHeight:1.5 }}>{c.content}</div>
                    <div style={{ fontSize:10, color:'#94a3b8', marginTop:4 }}>
                      {new Date(c.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <input
                placeholder="Escribe una nota o comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                style={{ flex:1, padding:'8px 12px', fontSize:12, borderRadius:8 }}
              />
              <button
                onClick={sendComment}
                disabled={!newComment.trim() || saving}
                className="btn-primary"
                style={{ padding:'8px 14px', fontSize:12, width:'auto', flexShrink:0 }}
              >
                Enviar
              </button>
            </div>
          </div>

          {/* Archivos */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#64748b', letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
              Archivos y links
            </div>

            {files.length === 0 ? (
              <div style={{ fontSize:12, color:'#94a3b8', padding:'4px 0 10px', fontStyle:'italic' }}>Sin archivos aún.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                {files.map(f => (
                  <a key={f.id} href={f.url || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, textDecoration:'none', transition:'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <span style={{ fontSize:16 }}>{f.type === 'link' ? '🔗' : '📄'}</span>
                    <span style={{ fontSize:12, color:'#334155', fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize:10, color:'#94a3b8' }}>↗</span>
                  </a>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="btn-ghost" style={{ fontSize:12, padding:'7px 14px' }}>
                {uploading ? 'Subiendo...' : '📎 Subir archivo'}
              </button>
              <button onClick={() => setShowLinkForm(!showLinkForm)}
                className="btn-ghost" style={{ fontSize:12, padding:'7px 14px' }}>
                🔗 Agregar link
              </button>
              <input ref={fileRef} type="file" style={{ display:'none' }} onChange={uploadFile}/>
            </div>

            {showLinkForm && (
              <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8, padding:'12px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
                <input placeholder="Nombre del link (ej: Diseño en Drive)" value={linkName} onChange={e => setLinkName(e.target.value)} style={{ fontSize:12, padding:'7px 10px', borderRadius:8 }}/>
                <input placeholder="URL (https://...)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={{ fontSize:12, padding:'7px 10px', borderRadius:8 }}/>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowLinkForm(false)} className="btn-ghost" style={{ flex:1, fontSize:12, padding:'7px' }}>Cancelar</button>
                  <button onClick={addLink} disabled={!linkUrl.trim()} className="btn-primary" style={{ flex:2, fontSize:12, padding:'7px', width:'auto' }}>Agregar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MemberView() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<(Profile & { color:string; bg:string }) | null>(null)
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'todas'|'pendiente'|'en progreso'|'listo'>('todas')

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: tasksData }] = await Promise.all([
        supabase.from('profiles').select('*').order('name'),
        supabase.from('tasks').select('*').eq('assigned_to', id).order('created_at'),
      ])
      if (profiles) {
        const idx = profiles.findIndex(p => p.id === id)
        if (idx >= 0) setProfile({ ...profiles[idx], ...TEAM_COLORS[idx % TEAM_COLORS.length] })
      }
      if (tasksData) setTasks(tasksData)
      setLoading(false)
    }
    load()
  }, [id])

  const filtered = filter === 'todas' ? tasks : tasks.filter(t => t.status === filter)
  const totalHrs = tasks.filter(t => t.status !== 'listo').reduce((s, t) => s + t.estimated_hrs, 0)
  const doneCount = tasks.filter(t => t.status === 'listo').length
  const pendCount = tasks.filter(t => t.status === 'pendiente').length
  const progCount = tasks.filter(t => t.status === 'en progreso').length

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8fafc' }}>
      <div style={{ fontSize:13, color:'#94a3b8' }}>Cargando tus tareas...</div>
    </div>
  )

  if (!profile) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8fafc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:14, color:'#334155', marginBottom:8 }}>Perfil no encontrado.</div>
        <button onClick={() => router.push('/member')} className="btn-primary" style={{ width:'auto', padding:'8px 20px' }}>Volver</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Image src="/zuko-logo.png" alt="ZUKO" width={80} height={32} style={{ objectFit:'contain' }}/>
          <div style={{ width:1, height:28, background:'#e2e8f0' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:profile.bg, color:profile.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, border:`2px solid ${profile.color}30` }}>
              {profile.initials}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{profile.name}</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>Vista personal</div>
            </div>
          </div>
        </div>
        <button onClick={() => router.push('/member')} className="btn-ghost" style={{ fontSize:12, padding:'7px 14px' }}>
          ← Cambiar usuario
        </button>
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:24 }}>
          {[
            { val: tasks.length,  lbl:'Total',       color: profile.color, bg: profile.bg },
            { val: pendCount,     lbl:'Pendientes',  color:'#f59e0b',      bg:'#fef3c7' },
            { val: progCount,     lbl:'En progreso', color:'#3b82f6',      bg:'#dbeafe' },
            { val: doneCount,     lbl:'Completadas', color:'#22c55e',      bg:'#dcfce7' },
          ].map(({ val, lbl, color, bg }) => (
            <div key={lbl} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Horas activas */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize:20 }}>⏱</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color: profile.color }}>{totalHrs}h</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>horas asignadas activas</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {(['todas','pendiente','en progreso','listo'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all .15s',
                background: filter===f ? profile.color : '#fff',
                color:      filter===f ? '#fff' : '#64748b',
                borderColor: filter===f ? profile.color : '#e2e8f0',
              }}>
              {f === 'todas' ? 'Todas' : f === 'pendiente' ? 'Pendientes' : f === 'en progreso' ? 'En progreso' : 'Completadas'}
            </button>
          ))}
        </div>

        {/* Lista de tareas */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'#94a3b8', fontSize:13 }}>
            {filter === 'todas' ? 'No tienes tareas asignadas aún.' : `No hay tareas en "${filter}".`}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(t => (
              <TaskPanel key={t.id} task={t} profile={profile} color={profile.color}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
