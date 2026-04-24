'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Profile, Task } from '@/lib/supabase'

interface Props {
  team: Profile[]
  tasks: Task[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--s3)', border: '1px solid var(--bdr2)',
        borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--tx)'
      }}>
        <div style={{ color:'var(--tx2)', marginBottom:2 }}>{label}</div>
        <div style={{ color:'var(--gold)', fontWeight:600 }}>{payload[0].value}h asignadas</div>
      </div>
    )
  }
  return null
}

export default function LoadChart({ team, tasks }: Props) {
  const data = team.map(p => {
    const load = tasks.filter(t => t.assigned_to === p.id).reduce((s, t) => s + t.estimated_hrs, 0)
    return { name: p.initials, fullName: p.name.split(' ')[0], load, color: p.color }
  })

  const maxLoad = Math.max(...data.map(d => d.load), 1)

  return (
    <div style={{ width:'100%', height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill:'var(--tx3)', fontSize:10 }}
            axisLine={{ stroke:'var(--bdr)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill:'var(--tx3)', fontSize:9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip/>} cursor={{ fill:'rgba(201,169,110,0.05)' }}/>
          <Bar dataKey="load" radius={[3,3,0,0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.load === maxLoad && entry.load > 0 ? 'var(--gold)' : entry.color + '99'}
                stroke={entry.load === maxLoad && entry.load > 0 ? 'var(--gold)' : entry.color + '44'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
