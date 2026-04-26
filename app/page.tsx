'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)', background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Image src="/zuko-logo.png" alt="ZUKO" width={140} height={56} style={{ objectFit: 'contain' }}/>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 12 }}>¿A dónde quieres ir?</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 360 }}>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            minHeight: 72,
            padding: '18px 20px', borderRadius: 16, border: '1.5px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 14, WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            🐊
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>La Pecera</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Tablero general del equipo</div>
          </div>
          <div style={{ fontSize: 18, color: '#22c55e' }}>→</div>
        </button>

        <button
          onClick={() => router.push('/member')}
          style={{
            minHeight: 72,
            padding: '18px 20px', borderRadius: 16, border: '1.5px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 14, WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            🌊
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Mi Laguna</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Ver mis tareas personales</div>
          </div>
          <div style={{ fontSize: 18, color: '#3b82f6' }}>→</div>
        </button>
      </div>
    </div>
  )
}
