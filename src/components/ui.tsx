'use client'

import { teamColor } from '@/lib/hooks'

export const NAVY = '#1e3a8a'
export const AMBER = '#d97706'
export const GREEN = '#16a34a'

export function TeamPill({ team, colors }: { team: string; colors: Map<string, string> }) {
  const color = teamColor(colors, team)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span>{team}</span>
    </span>
  )
}

export function GroupBadge({ group }: { group: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: NAVY,
        background: '#eef2ff',
        padding: '2px 8px',
        borderRadius: 5,
        letterSpacing: '.04em',
      }}
    >
      Grupo {group}
    </span>
  )
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-.01em',
        }}
      >
        {title}
      </h2>
      {action && (
        <button
          onClick={onAction}
          style={{
            fontSize: 12,
            color: NAVY,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {action} →
        </button>
      )}
    </div>
  )
}

export function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '80px 20px',
        color: '#94a3b8',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid #e2e8f0',
          borderTopColor: NAVY,
          animation: 'spin .7s linear infinite',
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 500 }}>Cargando…</span>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '80px 20px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 28 }}>⚠️</span>
      <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
        {message ?? 'No pudimos cargar la información.'}
      </p>
      {onRetry && (
        <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: 13 }} onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
