'use client'

import { useEffect } from 'react'
import type { Player, Team } from '@/lib/types'
import { teamColor } from '@/lib/hooks'

export default function TeamModal({
  team,
  colors,
  onClose,
}: {
  team: Team
  colors: Map<string, string>
  onClose: () => void
}) {
  const color = teamColor(colors, team.name)
  const roster: Player[] = (team.players ?? [])
    .slice()
    .sort((a, b) => a.num - b.num)

  useEffect(() => {
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
  }, [onClose])

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
          maxWidth: 520,
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
            padding: '20px 22px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${color}18`,
              border: `2px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              {team.name}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
              {roster.length} jugadores registrados
            </p>
          </div>
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

        <div style={{ overflowY: 'auto', padding: '14px 22px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {roster.map((pl) => (
              <div
                key={pl.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid #f1f5f9',
                  background: '#fafbfc',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fafbfc')}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    color: `${color}`,
                    width: 26,
                    textAlign: 'center',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {pl.num}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{pl.name}</div>
                  {(pl.studentName || pl.guardianType) && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                      {[pl.guardianType, pl.studentName && `Alumno: ${pl.studentName}`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {roster.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>
              No hay jugadores registrados para este equipo.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
