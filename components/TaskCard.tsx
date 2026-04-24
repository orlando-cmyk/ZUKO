'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/lib/supabase'

const PRI: Record<string, string> = {
  alta: '#ef4444', media: '#f59e0b', baja: '#22c55e',
}

interface Props {
  task: Task
  disabled?: boolean
}

export default function TaskCard({ task, disabled }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled })

  const deadline = task.deadline
    ? new Date(task.deadline + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    : null

  const catStyle = {
    diseño:    { bg: '#ede9fe', color: '#6d28d9' },
    dev:       { bg: '#dbeafe', color: '#1d4ed8' },
    marketing: { bg: '#fef3c7', color: '#92400e' },
    ops:       { bg: '#dcfce7', color: '#15803d' },
  }[task.category] || { bg: '#f1f5f9', color: '#64748b' }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        background: '#fff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 12,
        padding: '11px 14px',
        cursor: disabled ? 'default' : 'grab',
        userSelect: 'none',
        marginBottom: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          flexShrink: 0, marginTop: 4,
          background: PRI[task.priority] || '#94a3b8',
        }} />
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', lineHeight: 1.4, flex: 1 }}>
          {task.name}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
          background: catStyle.bg, color: catStyle.color,
        }}>
          {task.category}
        </span>
        {deadline && (
          <span style={{ fontSize: 11, color: '#94a3b8' }}>📅 {deadline}</span>
        )}
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 600,
          color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6,
        }}>
          {task.estimated_hrs}h
        </span>
      </div>
    </div>
  )
}
