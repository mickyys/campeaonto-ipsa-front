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

export function GroupBadge({ group, label }: { group: string; label?: string }) {
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
      {label ?? `Grupo ${group}`}
    </span>
  )
}

export function CupIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 576 512"
      fill={color}
      role="img"
      aria-hidden="true"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <path d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 28.7-64 64h160h128c0-35.3-28.7-64-64-64h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7C553.5 216.4 576 179.7 576 144V88c0-13.3-10.7-24-24-24zM64 128v35.3c0 16.7 5.6 33.3 15.8 47.1C64.4 189.5 64 158.9 64 128zm448 0c0 30.9-.4 61.5-15.8 82.3 10.2-13.8 15.8-30.4 15.8-47.1V128z" />
    </svg>
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
