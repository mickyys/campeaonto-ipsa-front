'use client'

import { useEffect } from 'react'
import type { Player, PlayerPos, Team } from '@/lib/types'
import { teamColor } from '@/lib/hooks'

const POS_ORDER: PlayerPos[] = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']
const POS_COLOR: Record<PlayerPos, string> = {
  Portero: '#d97706',
  Defensa: '#1e3a8a',
  Mediocampista: '#0284c7',
  Delantero: '#dc2626',
}
const POS_BG: Record<PlayerPos, string> = {
  Portero: '#fef3c7',
  Defensa: '#dbeafe',
  Mediocampista: '#e0f2fe',
  Delantero: '#fee2e2',
}

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
  const roster: Player[] = team.players ?? []
  const grouped = POS_ORDER.reduce<Record<PlayerPos, Player[]>>((acc, p) => {
    acc[p] = roster.filter((pl) => pl.pos === p).sort((a, b) => a.num - b.num)
    return acc
  }, { Portero: [], Defensa: [], Mediocampista: [], Delantero: [] })

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
          {POS_ORDER.filter((p) => grouped[p].length > 0).map((pos) => (
            <div key={pos} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: POS_COLOR[pos],
                    background: POS_BG[pos],
                    borderRadius: 5,
                    padding: '2px 8px',
                  }}
                >
                  {pos}
                </span>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>{grouped[pos].length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {grouped[pos].map((pl) => (
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
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#334155' }}>
                      {pl.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
