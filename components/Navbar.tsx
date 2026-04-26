'use client'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const active = (path: string) =>
    pathname === path || (path !== '/' && pathname.startsWith(path))

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 52, flexShrink: 0,
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 20px',
    }}>
      <Image
        src="/zuko-logo.png" alt="ZUKO"
        width={isMobile ? 72 : 90} height={isMobile ? 29 : 36}
        style={{ objectFit: 'contain', cursor: 'pointer' }}
        onClick={() => router.push('/')}
      />

      <div style={{ display: 'flex', gap: isMobile ? 6 : 6 }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: isMobile ? '7px 10px' : '6px 14px',
            borderRadius: 10, border: '1.5px solid',
            fontSize: isMobile ? 12 : 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            background: active('/dashboard') ? '#dcfce7' : '#fff',
            borderColor: active('/dashboard') ? '#22c55e' : '#e2e8f0',
            color: active('/dashboard') ? '#16a34a' : '#64748b',
          }}
          onMouseEnter={e => {
            if (!active('/dashboard')) {
              e.currentTarget.style.borderColor = '#22c55e'
              e.currentTarget.style.color = '#16a34a'
              e.currentTarget.style.background = '#f0fdf4'
            }
          }}
          onMouseLeave={e => {
            if (!active('/dashboard')) {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.background = '#fff'
            }
          }}
        >
          🏊{!isMobile && ' La Pecera'}
        </button>

        <button
          onClick={() => router.push('/member')}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: isMobile ? '7px 10px' : '6px 14px',
            borderRadius: 10, border: '1.5px solid',
            fontSize: isMobile ? 12 : 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            background: active('/member') ? '#dbeafe' : '#fff',
            borderColor: active('/member') ? '#3b82f6' : '#e2e8f0',
            color: active('/member') ? '#2563eb' : '#64748b',
          }}
          onMouseEnter={e => {
            if (!active('/member')) {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.color = '#2563eb'
              e.currentTarget.style.background = '#eff6ff'
            }
          }}
          onMouseLeave={e => {
            if (!active('/member')) {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.background = '#fff'
            }
          }}
        >
          🌊{!isMobile && ' Mi Laguna'}
        </button>
      </div>
    </nav>
  )
}
