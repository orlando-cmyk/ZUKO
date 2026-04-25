'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CrocMascot from '@/components/CrocMascot'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Revisa tu email para confirmar tu cuenta.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos.')
      else router.replace('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
        {/* Logo + Cocho */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:8 }}>
            <CrocMascot mood="happy" size={64} />
            <div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:22, color:'var(--gold)', letterSpacing:3, fontStyle:'italic' }}>
                Noir Tasks
              </div>
              <div style={{ fontSize:10, color:'var(--tx3)', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>
                Gestión de equipo
              </div>
            </div>
          </div>
        </div>

        {/* Card login */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <div style={{ fontSize:13, color:'var(--tx2)', marginBottom:20, textAlign:'center' }}>
            {isSignUp ? 'Crear cuenta nueva' : 'Iniciar sesión'}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:10, color:'var(--tx3)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:5 }}>
                Email
              </label>
              <input
                type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label style={{ fontSize:10, color:'var(--tx3)', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:5 }}>
                Contraseña
              </label>
              <input
                type="password" value={password} required minLength={6}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ fontSize:11, color: error.includes('email') && isSignUp ? 'var(--gold)' : 'var(--red)', padding:'8px 10px', background:'rgba(196,90,58,0.1)', borderRadius:6 }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:16 }}>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              style={{ background:'none', border:'none', color:'var(--tx3)', fontSize:11, cursor:'pointer', textDecoration:'underline' }}
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:16, fontSize:10, color:'var(--tx3)' }}>
          Cocho cuida tu equipo 🐊
        </div>
      </div>
    </div>
  )
}
