'use client'

import { useState } from 'react'
import Image from 'next/image'
import { api, setAccessToken } from '@/lib/api'
import { AdminButton, ErrorNote, Field, inputStyle, NAVY } from './ui'

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await api<{ accessToken: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      setAccessToken(data.accessToken)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360, margin: '8vh auto 0', padding: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <Image src="/ipsa-logo.png" alt="IPSA" width={56} height={56} style={{ objectFit: 'contain', marginBottom: 10 }} />
        <h2 style={{ margin: 0, fontSize: 18, color: '#0f172a', textAlign: 'center' }}>Acceso Administrador</h2>
        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#94a3b8', textAlign: 'center' }}>
          Panel de gestión del Campeonato de Apoderados IPSA San Antonio
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Correo">
          <input
            style={inputStyle}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ipsa.cl"
            required
          />
        </Field>
        <Field label="Contraseña">
          <input
            style={inputStyle}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>

        {error && <ErrorNote msg={error} />}

        <AdminButton type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </AdminButton>
      </form>

      <p style={{ margin: '18px 0 0', fontSize: 11.5, color: '#94a3b8', textAlign: 'center' }}>
        ¿Eres administrador? Pide tus credenciales al Centro de Padres.
      </p>
      <div style={{ marginTop: 12, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${NAVY}, #d97706)`, opacity: 0.5 }} />
    </div>
  )
}
