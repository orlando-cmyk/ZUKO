'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { createClient, type Task, type Profile } from '@/lib/supabase'
import CrocMascot, { type CrocMood } from '@/components/CrocMascot'
import TaskCard from '@/components/TaskCard'
import LoadChart from '@/components/LoadChart'
import { useIsMobile } from '@/hooks/useIsMobile'

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

const MSGS: Record<string,string[]> = {
  idle:      ['¡Hola! Soy Zuko. Arrastra tareas al equipo para empezar.','¿Listo para organizar el equipo? ¡Yo sí!','Todo bajo control. Zuko vigila.'],
  assign:    ['¡Perfecto! Zuko aprueba esa asignación.','Excelente movimiento. ¡El equipo avanza!','¡Así se trabaja! Seguimos adelante.'],
  unassign:  ['Tarea de vuelta al pool. Sin problema.','A veces hay que reasignar. ¡Adelante!'],
  overload:  ['¡Ojo! Alguien tiene demasiadas horas. Redistribuye.','Cuidado con la sobrecarga — Zuko está atento.'],
  allDone:   ['¡Todas las tareas asignadas! Zuko está muy orgulloso.','¡Pool vacío! El equipo tiene todo. ¡A trabajar!'],
  click:     ['¡Snap! Soy Zuko, el gestor oficial.','¿Necesitas algo? Aquí estoy.','¡Hola! ¿Todo marchando bien?'],
  addTask:   ['¡Nueva tarea registrada! Zuko toma nota.','Tarea agregada. ¡Vamos con todo!'],
  addPerson: ['¡Nuevo miembro en el equipo! Bienvenido.','El equipo crece. ¡Zuko está feliz!'],
  delete:    ['Tarea eliminada del registro.','¡Borrada! Una menos en la lista.'],
  done:      ['¡Tarea completada! Zuko celebra contigo. 🎉','¡Terminada! ¡Excelente trabajo!','¡Completada! Zuko hace su baile victorioso.'],
}

function rnd(arr: string[]) { return arr[Math.floor(Math.random()*arr.length)] }
function colorForIndex(i: number) { return TEAM_COLORS[i % TEAM_COLORS.length] }

function getWeekInfo() {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
  const totalWeeks  = Math.ceil(daysInMonth / 7)
  const currentWeek = Math.ceil(now.getDate() / 7)
  const monthName   = now.toLocaleDateString('es-MX', { month:'long', year:'numeric' })
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0)
  const endOfWeek   = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23,59,59,999)
  return { currentWeek, totalWeeks, monthName, startOfWeek, endOfWeek }
}

function isThisWeek(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr)
  return d >= start && d <= end
}

const MODAL_OVERLAY: React.CSSProperties = {
  position:'fixed', inset:0, background:'rgba(15,23,42,0.5)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
  backdropFilter:'blur(4px)',
}
const MODAL_CARD: React.CSSProperties = {
  background:'#fff', borderRadius:20, padding:'28px 32px',
  width:'100%', maxWidth:460,
  boxShadow:'0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
  display:'flex', flexDirection:'column', gap:18,
}
const FLD: React.CSSProperties = { display:'flex', flexDirection:'column', gap:6 }
const LBL: React.CSSProperties = { fontSize:12, fontWeight:600, color:'#475569', letterSpacing:0.3 }

function AddTaskModal({ onClose, onSave }: { onClose:()=>void, onSave:(t:Partial<Task>)=>Promise<void> }) {
  const [name, setName]         = useState('')
  const [cat, setCat]           = useState('dev')
  const [pri, setPri]           = useState('media')
  const [hrs, setHrs]           = useState(1)
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving]     = useState(false)

  async function submit() {
    if (!name.trim() || saving) return
    setSaving(true)
    await onSave({ name:name.trim(), category:cat as any, priority:pri as any, estimated_hrs:hrs, deadline:deadline||null, status:'pendiente', assigned_to:null })
    onClose()
  }

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div className="modal-card" style={MODAL_CARD} onClick={e=>e.stopPropagation()}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Nueva tarea</div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>Completa los detalles de la tarea</div>
        </div>

        <div style={FLD}>
          <label style={LBL}>Nombre de la tarea</label>
          <input placeholder="Ej: Rediseño landing page" value={name} onChange={e=>setName(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={FLD}>
            <label style={LBL}>Categoría</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              <option value="dev">Dev</option>
              <option value="diseño">Diseño</option>
              <option value="marketing">Marketing</option>
              <option value="ops">Ops</option>
            </select>
          </div>
          <div style={FLD}>
            <label style={LBL}>Prioridad</label>
            <select value={pri} onChange={e=>setPri(e.target.value)}>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Media</option>
              <option value="baja">🟢 Baja</option>
            </select>
          </div>
        </div>

        <div style={FLD}>
          <label style={LBL}>¿Cuántas horas lleva esta tarea?</label>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <input type="number" min={1} max={999} value={hrs}
              onChange={e=>setHrs(Math.max(1,parseInt(e.target.value)||1))}
              style={{ width:100 }}/>
            <span style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>horas estimadas</span>
          </div>
        </div>

        <div style={FLD}>
          <label style={LBL}>Fecha límite <span style={{ fontWeight:400, color:'#94a3b8' }}>(opcional)</span></label>
          <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex:1 }}>Cancelar</button>
          <button className="btn-primary" onClick={submit} style={{ flex:2 }} disabled={!name.trim()||saving}>
            {saving ? 'Guardando...' : '+ Agregar tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddPersonModal({ onClose, onSave }: { onClose:()=>void, onSave:(p:{name:string,initials:string})=>Promise<void> }) {
  const [name, setName]         = useState('')
  const [initials, setInitials] = useState('')
  const [saving, setSaving]     = useState(false)

  function handleName(v: string) {
    setName(v)
    const parts = v.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) setInitials((parts[0][0]+parts[1][0]).toUpperCase())
    else if (parts.length===1 && parts[0].length>=2) setInitials(parts[0].slice(0,2).toUpperCase())
  }

  async function submit() {
    if (!name.trim() || saving) return
    setSaving(true)
    await onSave({ name:name.trim(), initials:initials||name.slice(0,2).toUpperCase() })
    onClose()
  }

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div className="modal-card" style={MODAL_CARD} onClick={e=>e.stopPropagation()}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:4 }}>Agregar persona</div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>Nuevo miembro al equipo</div>
        </div>
        <div style={FLD}>
          <label style={LBL}>Nombre completo</label>
          <input placeholder="Ej: Alejandra Martínez" value={name} onChange={e=>handleName(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </div>
        <div style={FLD}>
          <label style={LBL}>Iniciales <span style={{ fontWeight:400, color:'#94a3b8' }}>(se auto-generan)</span></label>
          <input placeholder="AM" value={initials} onChange={e=>setInitials(e.target.value.toUpperCase().slice(0,2))} maxLength={2} style={{ width:90 }}/>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex:1 }}>Cancelar</button>
          <button className="btn-primary" onClick={submit} style={{ flex:2 }} disabled={!name.trim()||saving}>
            {saving ? 'Guardando...' : '+ Agregar al equipo'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskPill({ task, onDelete }: { task:Task, onDelete:(id:string)=>void }) {
  const deadline = task.deadline
    ? new Date(task.deadline+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'})
    : null
  const priColor = task.priority==='alta'?'#ef4444':task.priority==='media'?'#f59e0b':'#22c55e'

  return (
    <div className="task-wrap" style={{ position:'relative', marginBottom:6 }}>
      <div style={{
        background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12,
        padding:'11px 14px', cursor:'grab', userSelect:'none',
        boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
        transition:'border-color .15s, box-shadow .15s, transform .15s',
      }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.boxShadow='0 4px 12px rgba(34,197,94,0.15)'; e.currentTarget.style.transform='translateY(-1px)' }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(0)' }}
      >
        <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:priColor, flexShrink:0, marginTop:4 }}/>
          <div style={{ fontSize:13, fontWeight:500, color:'#0f172a', lineHeight:1.4, flex:1 }}>{task.name}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
          <span className={`badge badge-${task.category}`}>{task.category}</span>
          {deadline && (
            <span style={{ fontSize:11, color:'#94a3b8', display:'flex', alignItems:'center', gap:3 }}>
              📅 {deadline}
            </span>
          )}
          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'#64748b', background:'#f1f5f9', padding:'2px 8px', borderRadius:6 }}>
            {task.estimated_hrs}h
          </span>
        </div>
      </div>
      <button onClick={e=>{ e.stopPropagation(); onDelete(task.id) }} className="delete-btn"
        title="Eliminar tarea"
        style={{ position:'absolute', top:8, right:8, background:'#fee2e2', border:'none', color:'#ef4444', borderRadius:6, fontSize:11, fontWeight:700, padding:'2px 6px', cursor:'pointer', opacity:0, transition:'opacity .15s' }}>
        ✕
      </button>
    </div>
  )
}

function DroppablePool({ tasks, search, onDelete }: { tasks:Task[], search:string, onDelete:(id:string)=>void }) {
  const { setNodeRef, isOver } = useDroppable({ id:'pool' })
  const filtered = tasks.filter(t => !search || t.name.toLowerCase().includes(search) || t.category.toLowerCase().includes(search))
  return (
    <div ref={setNodeRef} style={{ flex:1, overflowY:'auto', padding:'0 16px 8px',
      background:isOver?'rgba(34,197,94,0.03)':'transparent', transition:'background .15s' }}>
      <SortableContext items={filtered.map(t=>t.id)} strategy={verticalListSortingStrategy}>
        {filtered.length===0 && tasks.length===0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 16px', gap:10, color:'#94a3b8', fontSize:13, textAlign:'center' }}>
            <CrocMascot mood="proud" size={60}/>
            <span style={{ fontWeight:600, color:'#16a34a' }}>¡Todo asignado!</span>
            <span>Zuko está muy orgulloso.</span>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:'24px 8px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>Sin resultados</div>
        ) : filtered.map(t => (
          <div key={t.id} className="task-wrap" style={{ position:'relative', marginBottom:6 }}>
            <TaskCard task={t}/>
            <button onClick={e=>{ e.stopPropagation(); onDelete(t.id) }} className="delete-btn"
              style={{ position:'absolute', top:8, right:8, background:'#fee2e2', border:'none', color:'#ef4444', borderRadius:6, fontSize:11, fontWeight:700, padding:'2px 6px', cursor:'pointer', opacity:0, transition:'opacity .15s' }}>
              ✕
            </button>
          </div>
        ))}
      </SortableContext>
      <style>{`.task-wrap:hover .delete-btn { opacity: 1 !important; }`}</style>
    </div>
  )
}

function DroppableDone({ tasks, weekStart, weekEnd, onRestore }: { tasks:Task[], weekStart:Date, weekEnd:Date, onRestore:(id:string)=>void }) {
  const { setNodeRef, isOver } = useDroppable({ id:'done' })
  const thisWeek = tasks.filter(t => t.completed_at && isThisWeek(t.completed_at, weekStart, weekEnd))
  const totalHrs = thisWeek.reduce((s,t)=>s+t.estimated_hrs,0)

  return (
    <div ref={setNodeRef} style={{
      margin:'8px 12px 12px',
      border:`2px dashed ${isOver?'#22c55e':'#bbf7d0'}`,
      borderRadius:14, background:isOver?'#f0fdf4':'#f8fffe',
      transition:'all .2s',
    }}>
      <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:thisWeek.length>0?'1px solid #dcfce7':'none' }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>✅</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>Terminadas esta semana</div>
          <div style={{ fontSize:11, color:'#86efac', marginTop:1 }}>
            {thisWeek.length} tarea{thisWeek.length!==1?'s':''} · {totalHrs}h
          </div>
        </div>
        {isOver && <span style={{ fontSize:11, color:'#16a34a', fontWeight:600 }}>¡Suelta aquí!</span>}
      </div>
      {thisWeek.length > 0 && (
        <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:4, maxHeight:130, overflowY:'auto' }}>
          {thisWeek.map(t=>(
            <div key={t.id} onClick={()=>onRestore(t.id)} title="Clic para restaurar"
              style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, cursor:'pointer', transition:'border-color .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='#22c55e')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='#bbf7d0')}
            >
              <span style={{ fontSize:12, color:'#22c55e', fontWeight:700 }}>✓</span>
              <span style={{ fontSize:11, color:'#475569', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:'line-through', opacity:0.7 }}>{t.name}</span>
              <span style={{ fontSize:11, fontWeight:600, color:'#16a34a' }}>{t.estimated_hrs}h</span>
              <span style={{ fontSize:11, color:'#94a3b8' }}>↩</span>
            </div>
          ))}
        </div>
      )}
      {thisWeek.length===0 && !isOver && (
        <div style={{ padding:'10px 14px', fontSize:12, color:'#86efac', textAlign:'center' }}>
          Arrastra tareas completadas aquí
        </div>
      )}
    </div>
  )
}

function PersonCard({ person, tasks, onUnassign }: { person:Profile&{color:string;bg:string}, tasks:Task[], onUnassign:(id:string)=>void }) {
  const { setNodeRef, isOver } = useDroppable({ id:person.id })
  const load = tasks.reduce((s,t)=>s+t.estimated_hrs,0)
  const pct  = Math.min(Math.round((load/40)*100),100)
  const over = load > 20

  return (
    <div ref={setNodeRef} style={{
      background:'#fff',
      border:`1.5px solid ${isOver?'#22c55e':over?'#fca5a5':'#e2e8f0'}`,
      borderRadius:14, marginBottom:8,
      boxShadow: isOver ? '0 0 0 4px rgba(34,197,94,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
      transition:'all .15s',
      overflow:'visible',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0, background:person.bg, color:person.color, border:`2px solid ${person.color}30` }}>
          {person.initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:6 }}>
            {person.name}
          </div>
          <div style={{ height:5, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, width:`${pct}%`, background:over?'#ef4444':'#22c55e', transition:'width .4s cubic-bezier(.4,0,.2,1)' }}/>
          </div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:over?'#ef4444':'#64748b', whiteSpace:'nowrap', marginLeft:8,
          background:over?'#fee2e2':'#f1f5f9', padding:'3px 8px', borderRadius:7 }}>
          {load}h
        </div>
      </div>

      {/* Tareas */}
      <div style={{ padding:'0 10px 10px', display:'flex', flexDirection:'column', gap:4 }}>
        {tasks.length===0 ? (
          <div style={{ padding:8, textAlign:'center', fontSize:12, color:'#94a3b8', border:'1.5px dashed #e2e8f0', borderRadius:10, background:isOver?'#f0fdf4':'transparent', transition:'background .15s' }}>
            {isOver ? '¡Suelta aquí!' : 'Arrastra tareas aquí'}
          </div>
        ) : tasks.map(t=>(
          <div key={t.id} onClick={()=>onUnassign(t.id)} title="Clic para devolver al pool"
            style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:9, padding:'7px 10px', cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='#fca5a5'; e.currentTarget.style.background='#fff5f5' }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc' }}
          >
            <div style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background:t.priority==='alta'?'#ef4444':t.priority==='media'?'#f59e0b':'#22c55e' }}/>
            <span style={{ fontSize:12, fontWeight:500, color:'#334155', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</span>
            <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8', background:'#e2e8f0', padding:'1px 6px', borderRadius:5 }}>{t.estimated_hrs}h</span>
            <span style={{ fontSize:13, color:'#cbd5e1' }}>×</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Timeline({ tasks, team }: { tasks:Task[], team:(Profile&{color:string})[] }) {
  const now=new Date(), year=now.getFullYear(), month=now.getMonth()
  const daysInMonth=new Date(year,month+1,0).getDate(), todayDay=now.getDate()
  const days=Array.from({length:daysInMonth},(_,i)=>i+1)
  const dayW=28, withDL=tasks.filter(t=>t.deadline&&t.status!=='listo')

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5 }}>
        {now.toLocaleDateString('es-MX',{month:'long',year:'numeric'})}
      </div>
      <div style={{ overflowX:'auto', background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'16px' }}>
        <div style={{ minWidth:daysInMonth*dayW+130, position:'relative' }}>
          <div style={{ display:'flex', marginLeft:120, marginBottom:10 }}>
            {days.map(d=>{
              const date=new Date(year,month,d), isWE=date.getDay()===0||date.getDay()===6, isToday=d===todayDay
              return (
                <div key={d} style={{ width:dayW, textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontSize:10, color:isWE?'#cbd5e1':'#94a3b8', marginBottom:2 }}>{['D','L','M','X','J','V','S'][date.getDay()]}</div>
                  <div style={{ fontSize:11, fontWeight:isToday?700:400, color:isToday?'#fff':'#64748b', background:isToday?'#22c55e':'transparent', borderRadius:6, width:22, margin:'0 auto', lineHeight:'22px' }}>{d}</div>
                </div>
              )
            })}
          </div>
          <div style={{ position:'absolute', top:0, bottom:0, left:120+(todayDay-1)*dayW+dayW/2, width:2, background:'rgba(34,197,94,0.4)', zIndex:1, pointerEvents:'none', borderRadius:1 }}/>
          {withDL.length===0 ? (
            <div style={{ padding:'24px 0', textAlign:'center', color:'#94a3b8', fontSize:13 }}>Agrega fechas límite para ver el timeline.</div>
          ) : withDL.map(task=>{
            const dl=new Date(task.deadline!+'T12:00:00')
            const dlDay=dl.getMonth()===month&&dl.getFullYear()===year?dl.getDate():null
            const person=team.find(p=>p.id===task.assigned_to)
            const isLate=dlDay&&dlDay<todayDay
            return (
              <div key={task.id} style={{ display:'flex', alignItems:'center', marginBottom:6 }}>
                <div style={{ width:120, paddingRight:10, flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'#334155', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={task.name}>{task.name}</div>
                  {person && <div style={{ fontSize:11, fontWeight:600, color:person.color }}>{person.initials}</div>}
                </div>
                <div style={{ display:'flex' }}>
                  {days.map(d=>{
                    const isDeadline=dlDay===d, date=new Date(year,month,d), isWE=date.getDay()===0||date.getDay()===6
                    return (
                      <div key={d} style={{ width:dayW, height:24, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:isWE?'rgba(0,0,0,0.01)':'transparent' }}>
                        {isDeadline ? (
                          <div title={`${task.name} — ${dl.toLocaleDateString('es-MX')}`} style={{
                            width:24, height:20, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10, color:'#fff', fontWeight:700,
                            background:isLate?'#ef4444':task.priority==='alta'?'#ef4444':task.priority==='media'?'#f59e0b':'#22c55e',
                          }}>{task.estimated_hrs}h</div>
                        ) : <div style={{ width:dayW, height:1, background:'#f1f5f9' }}/>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        {[{c:'#ef4444',l:'Alta prioridad'},{c:'#f59e0b',l:'Media'},{c:'#22c55e',l:'Baja'},{c:'#ef4444',l:'Vencida',dashed:true}].map(({c,l})=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#64748b' }}>
            <div style={{ width:12, height:12, borderRadius:3, background:c }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [tasks,setTasks]                   = useState<Task[]>([])
  const [team,setTeam]                     = useState<(Profile&{color:string;bg:string})[]>([])
  const [loading,setLoading]               = useState(true)
  const [activeTask,setActiveTask]         = useState<Task|null>(null)
  const [search,setSearch]                 = useState('')
  const [mood,setMood]                     = useState<CrocMood>('idle')
  const [speech,setSpeech]                 = useState(rnd(MSGS.idle))
  const [activeTab,setActiveTab]           = useState<'pool'|'team'|'chart'|'timeline'>('team')
  const [showAddTask,setShowAddTask]       = useState(false)
  const [showAddPerson,setShowAddPerson]   = useState(false)

  const pendingTaskIds   = useRef(new Set<string>())
  const pendingPersonIds = useRef(new Set<string>())
  const supabase = createClient()
  const isMobile = useIsMobile()
  const sensors  = useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}))
  const {currentWeek,totalWeeks,monthName,startOfWeek,endOfWeek} = getWeekInfo()

  const showMsg = useCallback((key:string,m:CrocMood)=>{ setMood(m); setSpeech(rnd(MSGS[key]||MSGS.idle)) },[])

  useEffect(()=>{
    async function load(){
      const [{data:td},{data:pd}] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at'),
        supabase.from('profiles').select('*').order('created_at'),
      ])
      if(td) setTasks(td)
      if(pd) setTeam(pd.map((p,i)=>({...p,...colorForIndex(i)})))
      setLoading(false)
    }
    load()
    const ch=supabase.channel('zuko-rt')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'tasks'},p=>{
        const id=p.new.id as string
        if(pendingTaskIds.current.has(id)) return
        setTasks(prev=>prev.find(t=>t.id===id)?prev:[...prev,p.new as Task])
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'tasks'},p=>{
        setTasks(prev=>prev.map(t=>t.id===p.new.id?p.new as Task:t))
      })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'tasks'},p=>{
        setTasks(prev=>prev.filter(t=>t.id!==p.old.id))
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'profiles'},p=>{
        const id=p.new.id as string
        if(pendingPersonIds.current.has(id)) return
        setTeam(prev=>prev.find(x=>x.id===id)?prev:[...prev,{...p.new as Profile,...colorForIndex(prev.length)}])
      })
      .subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[])

  async function handleAddTask(data:Partial<Task>){
    const {data:nt}=await supabase.from('tasks').insert([data]).select().single()
    if(nt){ pendingTaskIds.current.add(nt.id); setTasks(prev=>prev.find(t=>t.id===nt.id)?prev:[...prev,nt]); setTimeout(()=>pendingTaskIds.current.delete(nt.id),3000) }
    showMsg('addTask','happy')
  }

  async function handleAddPerson(data:{name:string,initials:string}){
    const {data:np}=await supabase.from('profiles').insert([data]).select().single()
    if(np){ pendingPersonIds.current.add(np.id); setTeam(prev=>prev.find(x=>x.id===np.id)?prev:[...prev,{...np,...colorForIndex(prev.length)}]); setTimeout(()=>pendingPersonIds.current.delete(np.id),3000) }
    showMsg('addPerson','happy')
  }

  async function handleDeleteTask(taskId:string){
    setTasks(prev=>prev.filter(t=>t.id!==taskId))
    await supabase.from('tasks').delete().eq('id',taskId)
    showMsg('delete','idle')
  }

  async function handleMarkDone(taskId:string){
    const now=new Date().toISOString()
    setTasks(prev=>prev.map(t=>t.id===taskId?{...t,status:'listo',assigned_to:null,completed_at:now}:t))
    await supabase.from('tasks').update({status:'listo',assigned_to:null,completed_at:now}).eq('id',taskId)
    showMsg('done','proud')
  }

  async function handleRestoreDone(taskId:string){
    setTasks(prev=>prev.map(t=>t.id===taskId?{...t,status:'pendiente',completed_at:null}:t))
    await supabase.from('tasks').update({status:'pendiente',completed_at:null}).eq('id',taskId)
    showMsg('unassign','idle')
  }

  const poolTasks    = tasks.filter(t=>!t.assigned_to&&t.status!=='listo')
  const doneTasks    = tasks.filter(t=>t.status==='listo')
  const doneThisWeek = doneTasks.filter(t=>t.completed_at&&isThisWeek(t.completed_at,startOfWeek,endOfWeek))
  const totalHrs     = tasks.filter(t=>t.assigned_to&&t.status!=='listo').reduce((s,t)=>s+t.estimated_hrs,0)
  const assignedCount= tasks.filter(t=>t.assigned_to&&t.status!=='listo').length
  const busiest      = team.reduce((b,p)=>{ const l=tasks.filter(t=>t.assigned_to===p.id&&t.status!=='listo').reduce((s,t)=>s+t.estimated_hrs,0); return l>b.load?{name:p.name.split(' ')[0],load:l}:b },{name:'—',load:0})

  function onDragStart({active}:DragStartEvent){ setActiveTask(tasks.find(t=>t.id===active.id)||null) }

  async function onDragEnd({active,over}:DragEndEvent){
    setActiveTask(null)
    if(!over) return
    const taskId=active.id as string, tgtId=over.id as string
    const task=tasks.find(t=>t.id===taskId)
    if(!task) return
    if(tgtId==='done'){ await handleMarkDone(taskId); return }
    if(tgtId==='pool'&&task.assigned_to){
      setTasks(prev=>prev.map(t=>t.id===taskId?{...t,assigned_to:null}:t))
      await supabase.from('tasks').update({assigned_to:null}).eq('id',taskId)
      showMsg('unassign','idle'); return
    }
    const tgt=team.find(p=>p.id===tgtId)
    if(tgt&&task.assigned_to!==tgtId){
      const newT=tasks.map(t=>t.id===taskId?{...t,assigned_to:tgtId}:t)
      setTasks(newT)
      await supabase.from('tasks').update({assigned_to:tgtId}).eq('id',taskId)
      const anyOver=team.some(p=>newT.filter(t=>t.assigned_to===p.id&&t.status!=='listo').reduce((s,t)=>s+t.estimated_hrs,0)>20)
      if(newT.filter(t=>t.status!=='listo').every(t=>t.assigned_to)) showMsg('allDone','proud')
      else if(anyOver) showMsg('overload','angry')
      else showMsg('assign','happy')
    }
  }

  async function unassign(taskId:string){
    setTasks(prev=>prev.map(t=>t.id===taskId?{...t,assigned_to:null}:t))
    await supabase.from('tasks').update({assigned_to:null}).eq('id',taskId)
    showMsg('unassign','idle')
  }

  if(loading) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'calc(100vh - 52px)',background:'#f8fafc',gap:16}}>
      <Image src="/zuko-logo.png" alt="Zuko" width={120} height={120} style={{objectFit:'contain'}}/>
      <div style={{fontSize:13,color:'#94a3b8',letterSpacing:1,fontWeight:500}}>Cargando...</div>
    </div>
  )

  return (
    <div style={{
      height: isMobile ? undefined : 'calc(100vh - 52px)',
      minHeight: isMobile ? 'calc(100vh - 52px)' : undefined,
      display:'flex', background:'#f8fafc',
      overflow: isMobile ? 'auto' : 'hidden',
    }}>

      {showAddTask   && <AddTaskModal   onClose={()=>setShowAddTask(false)}   onSave={handleAddTask}/>}
      {showAddPerson && <AddPersonModal onClose={()=>setShowAddPerson(false)} onSave={handleAddPerson}/>}

      {/* Sidebar — solo desktop */}
      {!isMobile && (
        <div style={{width:220,background:'#fff',borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',flexShrink:0,boxShadow:'1px 0 4px rgba(0,0,0,0.04)'}}>
          <div style={{padding:'20px 16px 12px',borderBottom:'1px solid #f1f5f9'}}>
            <Image src="/zuko-logo.png" alt="Zuko" width={130} height={52} style={{objectFit:'contain',cursor:'pointer'}} onClick={()=>showMsg('click','happy')}/>
          </div>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f1f5f9',background:'#f0fdf4'}}>
            <div style={{fontSize:11,color:'#16a34a',fontWeight:700,letterSpacing:0.3}}>SEMANA {currentWeek} DE {totalWeeks}</div>
            <div style={{fontSize:11,color:'#86efac',marginTop:1}}>{monthName}</div>
          </div>
          <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8,borderBottom:'1px solid #f1f5f9'}}>
            {[
              {icon:'⏱', val:`${totalHrs}h`, lbl:'Horas activas', color:'#7c3aed'},
              {icon:'📋', val:assignedCount, lbl:'Tareas asignadas', color:'#2563eb'},
              {icon:'✅', val:doneThisWeek.length, lbl:'Completadas semana', color:'#16a34a'},
              {icon:'👑', val:busiest.name, lbl:'Mayor carga', color:'#d97706'},
            ].map(({icon,val,lbl,color})=>(
              <div key={lbl} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'#f8fafc',borderRadius:10}}>
                <span style={{fontSize:16}}>{icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}>{lbl}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',flex:1}}>
            <div style={{fontSize:11,color:'#64748b',fontStyle:'italic',lineHeight:1.5,background:'#f0fdf4',borderRadius:10,padding:'10px 12px',border:'1px solid #dcfce7'}}>
              {speech}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Header */}
        <div style={{
          background:'#fff', borderBottom:'1px solid #e2e8f0',
          padding: isMobile ? '10px 12px' : '14px 24px',
          display:'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent:'space-between', flexShrink:0,
          boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
          gap: isMobile ? 8 : 0,
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
            <div style={{fontSize: isMobile ? 15 : 18, fontWeight:700, color:'#0f172a'}}>
              {isMobile ? '🐊 Zuko Tasks' : 'Tablero de tareas'}
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <button className="btn-ghost" onClick={()=>setShowAddPerson(true)}
                style={{whiteSpace:'nowrap',padding: isMobile ? '8px 10px' : '9px 16px',fontSize:13}}>
                + Persona
              </button>
              <button className="btn-primary" onClick={()=>setShowAddTask(true)}
                style={{whiteSpace:'nowrap',padding: isMobile ? '8px 12px' : '9px 20px',fontSize:13,width:'auto'}}>
                {isMobile ? '+ Tarea' : '+ Nueva tarea'}
              </button>
            </div>
          </div>
          <div style={{position:'relative'}}>
            <input placeholder="Buscar tarea..." value={search} onChange={e=>setSearch(e.target.value.toLowerCase())}
              style={{width: isMobile ? '100%' : 220, fontSize:13, padding:'8px 14px 8px 36px', borderRadius:10}}/>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#94a3b8'}}>🔍</span>
          </div>
        </div>

        {/* Board */}
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {isMobile ? (
            /* ── MÓVIL: columna única, nav en bottom bar ── */
            <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
              {/* Contenido móvil — padding-bottom para el bottom nav */}
              <div style={{flex:1,overflowY:'auto',paddingBottom:64}}>

                {activeTab==='pool' && (
                  <>
                    <div style={{padding:'12px 12px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f8fafc'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#334155'}}>Sin asignar</span>
                      <span style={{background:'#e2e8f0',color:'#64748b',fontSize:12,fontWeight:700,padding:'2px 10px',borderRadius:20}}>{poolTasks.length}</span>
                    </div>
                    <DroppablePool tasks={poolTasks} search={search} onDelete={handleDeleteTask}/>
                    <DroppableDone tasks={doneTasks} weekStart={startOfWeek} weekEnd={endOfWeek} onRestore={handleRestoreDone}/>
                  </>
                )}

                {activeTab==='team' && (
                  <div style={{padding:'12px'}}>
                    {team.length===0 ? (
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px',gap:12,color:'#94a3b8',textAlign:'center'}}>
                        <CrocMascot mood="sleep" size={60}/>
                        <div style={{fontSize:13,fontWeight:600,color:'#64748b'}}>No hay personas aún</div>
                        <div style={{fontSize:12}}>Toca <b style={{color:'#22c55e'}}>+ Persona</b> para agregar</div>
                      </div>
                    ) : team.map(p=>(
                      <PersonCard key={p.id} person={p} tasks={tasks.filter(t=>t.assigned_to===p.id&&t.status!=='listo')} onUnassign={unassign}/>
                    ))}
                  </div>
                )}

                {activeTab==='chart' && (
                  <div style={{padding:'14px 12px',display:'flex',flexDirection:'column',gap:12}}>
                    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:'14px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#334155',marginBottom:12}}>Horas por persona</div>
                      <LoadChart team={team} tasks={tasks.filter(t=>t.status!=='listo')}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[
                        {val:totalHrs,lbl:'Horas activas',icon:'⏱',color:'#7c3aed',bg:'#ede9fe'},
                        {val:assignedCount,lbl:'Asignadas',icon:'📋',color:'#2563eb',bg:'#dbeafe'},
                        {val:doneThisWeek.length,lbl:'Completadas',icon:'✅',color:'#16a34a',bg:'#dcfce7'},
                        {val:busiest.name,lbl:'Mayor carga',icon:'👑',color:'#d97706',bg:'#fef3c7'},
                      ].map(({val,lbl,icon,color,bg})=>(
                        <div key={lbl} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'10px',display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{width:30,height:30,borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{icon}</div>
                          <div>
                            <div style={{fontSize:16,fontWeight:700,color,lineHeight:1}}>{val}</div>
                            <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}>{lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {doneThisWeek.length>0 && (
                      <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'10px 14px'}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#15803d',marginBottom:3}}>✅ Esta semana: {doneThisWeek.reduce((s,t)=>s+t.estimated_hrs,0)}h</div>
                        <div style={{fontSize:11,color:'#86efac'}}>{doneThisWeek.map(t=>t.name).join(' · ')}</div>
                      </div>
                    )}
                    {team.some(p=>tasks.filter(t=>t.assigned_to===p.id&&t.status!=='listo').reduce((s,t)=>s+t.estimated_hrs,0)>20) && (
                      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'10px 12px',fontSize:12,color:'#dc2626'}}>
                        ⚠️ Zuko detecta sobrecarga — redistribuye horas.
                      </div>
                    )}
                  </div>
                )}

                {activeTab==='timeline' && <Timeline tasks={tasks} team={team}/>}
              </div>
            </div>
          ) : (
            /* ── DESKTOP: grid original ── */
            <div style={{display:'grid',gridTemplateColumns:'260px 1fr',flex:1,overflow:'hidden'}}>

              {/* Pool column */}
              <div style={{borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f8fafc'}}>
                <div style={{padding:'16px 16px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:'#334155'}}>Sin asignar</span>
                  <span style={{background:'#e2e8f0',color:'#64748b',fontSize:12,fontWeight:700,padding:'2px 10px',borderRadius:20}}>{poolTasks.length}</span>
                </div>
                <DroppablePool tasks={poolTasks} search={search} onDelete={handleDeleteTask}/>
                <DroppableDone tasks={doneTasks} weekStart={startOfWeek} weekEnd={endOfWeek} onRestore={handleRestoreDone}/>
              </div>

              {/* Panel derecho */}
              <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
                <div style={{display:'flex',borderBottom:'1px solid #e2e8f0',background:'#fff',padding:'0 20px',flexShrink:0}}>
                  {(['team','chart','timeline'] as const).map(tab=>(
                    <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                      padding:'14px 16px', fontSize:13, fontWeight:600,
                      color:activeTab===tab?'#16a34a':'#94a3b8',
                      background:'none', border:'none',
                      borderBottom:activeTab===tab?'2.5px solid #22c55e':'2.5px solid transparent',
                      cursor:'pointer', transition:'color .15s', fontFamily:'inherit',
                    }}>
                      {tab==='team'?'👥 Equipo':tab==='chart'?'📊 Carga':'📅 Timeline'}
                    </button>
                  ))}
                </div>

                {activeTab==='team' && (
                  <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
                    {team.length===0 ? (
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 20px',gap:12,color:'#94a3b8',textAlign:'center'}}>
                        <CrocMascot mood="sleep" size={70}/>
                        <div style={{fontSize:14,fontWeight:600,color:'#64748b'}}>No hay personas aún</div>
                        <div style={{fontSize:13}}>Haz clic en <b style={{color:'#22c55e'}}>+ Persona</b> para agregar al equipo</div>
                      </div>
                    ) : team.map(p=>(
                      <PersonCard key={p.id} person={p} tasks={tasks.filter(t=>t.assigned_to===p.id&&t.status!=='listo')} onUnassign={unassign}/>
                    ))}
                  </div>
                )}

                {activeTab==='chart' && (
                  <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:16,padding:'20px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#334155',marginBottom:14}}>Horas asignadas por persona</div>
                      <LoadChart team={team} tasks={tasks.filter(t=>t.status!=='listo')}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                      {[
                        {val:totalHrs,lbl:'Horas activas',icon:'⏱',color:'#7c3aed',bg:'#ede9fe'},
                        {val:assignedCount,lbl:'Tareas asignadas',icon:'📋',color:'#2563eb',bg:'#dbeafe'},
                        {val:doneThisWeek.length,lbl:'Completadas semana',icon:'✅',color:'#16a34a',bg:'#dcfce7'},
                      ].map(({val,lbl,icon,color,bg})=>(
                        <div key={lbl} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:'16px 18px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',display:'flex',gap:12,alignItems:'center'}}>
                          <div style={{width:40,height:40,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{icon}</div>
                          <div>
                            <div style={{fontSize:22,fontWeight:700,color,lineHeight:1}}>{val}</div>
                            <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {doneThisWeek.length>0 && (
                      <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'14px 16px'}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#15803d',marginBottom:6}}>✅ Esta semana: {doneThisWeek.reduce((s,t)=>s+t.estimated_hrs,0)}h completadas</div>
                        <div style={{fontSize:12,color:'#86efac'}}>{doneThisWeek.map(t=>t.name).join(' · ')}</div>
                      </div>
                    )}
                    {team.some(p=>tasks.filter(t=>t.assigned_to===p.id&&t.status!=='listo').reduce((s,t)=>s+t.estimated_hrs,0)>20) && (
                      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#dc2626'}}>
                        ⚠️ Zuko detecta sobrecarga — redistribuye horas entre el equipo.
                      </div>
                    )}
                  </div>
                )}

                {activeTab==='timeline' && <Timeline tasks={tasks} team={team}/>}
              </div>
            </div>
          )}
          <DragOverlay>{activeTask?<TaskCard task={activeTask} disabled/>:null}</DragOverlay>
        </DndContext>

        {/* ── Bottom Nav — móvil ── */}
        {isMobile && (
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:40,
            height:56, background:'#fff',
            borderTop:'1px solid #e2e8f0',
            boxShadow:'0 -2px 8px rgba(0,0,0,0.07)',
            display:'flex',
          }}>
            {([
              { id:'pool',     icon:'📋', label: poolTasks.length ? `Pool (${poolTasks.length})` : 'Pool' },
              { id:'team',     icon:'👥', label:'Equipo'   },
              { id:'chart',    icon:'📊', label:'Carga'    },
              { id:'timeline', icon:'📅', label:'Timeline' },
            ] as const).map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:2,
                  border:'none', borderTop: activeTab===id ? '2px solid #22c55e' : '2px solid transparent',
                  background:'none', cursor:'pointer', fontFamily:'inherit',
                  color: activeTab===id ? '#16a34a' : '#94a3b8',
                  padding:'6px 0',
                  WebkitTapHighlightColor:'transparent',
                  transition:'color .15s',
                }}
              >
                <span style={{fontSize:20, lineHeight:1}}>{icon}</span>
                <span style={{fontSize:10, fontWeight: activeTab===id ? 700 : 500, lineHeight:1.2}}>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
