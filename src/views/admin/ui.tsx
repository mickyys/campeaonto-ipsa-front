'use client'

import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export const NAVY = '#1e3a8a'
export const AMBER = '#d97706'

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  marginBottom: 4,
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {hint && <span style={{ color: '#94a3b8', fontWeight: 400 }}> ({hint})</span>}
      </label>
      {children}
    </div>
  )
}

export function AdminButton({
  children,
  onClick,
  tone = 'primary',
  type = 'button',
  disabled,
  small,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: 'primary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
  small?: boolean
}) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: small ? 12 : 13,
    padding: small ? '5px 10px' : '9px 16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: '1.5px solid transparent',
    transition: 'all .15s',
  }
  if (tone === 'primary') {
    base.background = NAVY
    base.color = '#fff'
  } else if (tone === 'ghost') {
    base.background = '#fff'
    base.borderColor = '#e2e8f0'
    base.color = '#475569'
  } else {
    base.background = '#fff'
    base.borderColor = '#fecaca'
    base.color = '#dc2626'
  }
  return (
    <button type={type} style={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function ErrorNote({ msg }: { msg?: string | null }) {
  if (!msg) return null
  return (
    <div
      style={{
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12.5,
        fontWeight: 500,
      }}
    >
      {msg}
    </div>
  )
}

export function SuccessNote({ msg }: { msg?: string | null }) {
  if (!msg) return null
  return (
    <div
      style={{
        background: '#f0fdf4',
        color: '#16a34a',
        border: '1px solid #bbf7d0',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12.5,
        fontWeight: 500,
      }}
    >
      {msg}
    </div>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 560,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: number
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', esc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeUp .2s ease both',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,23,42,.18)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', flex: 1 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 14,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 22px 22px' }}>{children}</div>
      </div>
    </div>
  )
}
