'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient, type Profile } from '@/lib/supabase'

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

export default function MemberSelect() {
  const router = useRouter()
  const [team, setTeam]       = useState<(Profile & { color:string; bg:string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('*').order('name').then(({ data }) => {
      if (data) setTeam(data.map((p, i) => ({ ...p, ...TEAM_COLORS[i % TEAM_COLORS.length] })))
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      {/* Logo */}
      <div style={{ marginBottom:32, textAlign:'center' }}>
        <Image src="/zuko-logo.png" alt="ZUKO" width={110} height={44} style={{ objectFit:'contain' }}/>
        <div style={{ marginTop:12, fontSize:16, fontWeight:600, color:'#0f172a' }}>¿Quién eres?</div>
        <div style={{ fontSize:13, color:'#94a3b8', marginTop:4 }}>Selecciona tu nombre para ver tus tareas</div>
      </div>

      {loading ? (
        <div style={{ fontSize:13, color:'#94a3b8' }}>Cargando equipo...</div>
      ) : team.length === 0 ? (
        <div style={{ fontSize:13, color:'#94a3b8', textAlign:'center' }}>
          No hay miembros en el equipo aún.<br/>
          <span style={{ fontSize:12 }}>Pídele al administrador que te agregue.</span>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, width:'100%', maxWidth:560 }}>
          {team.map(p => (
            <button
              key={p.id}
              onClick={() => router.push(`/member/${p.id}`)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                padding:'20px 16px', background:'#fff',
                border:'1.5px solid #e2e8f0', borderRadius:14,
                cursor:'pointer', transition:'all .15s',
                boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = `0 4px 12px ${p.color}30` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div style={{ width:48, height:48, borderRadius:'50%', background:p.bg, color:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, border:`2px solid ${p.color}30` }}>
                {p.initials}
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', textAlign:'center' }}>{p.name}</div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        style={{ marginTop:32, fontSize:12, color:'#94a3b8', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}
      >
        Ir al tablero de administrador
      </button>
    </div>
  )
}
