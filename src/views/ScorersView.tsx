'use client'

import { useScorers, useTeamColorMap, useTeams, teamColor } from '@/lib/hooks'
import { LoadingState, ErrorState, SectionHeader, NAVY, AMBER } from '@/components/ui'

export default function ScorersView() {
  const scorersQ = useScorers()
  const teamsQ = useTeams()
  const colors = useTeamColorMap(teamsQ.data)

  const loading = scorersQ.isPending || teamsQ.isPending
  const error = scorersQ.error ?? teamsQ.error
  const scorers = scorersQ.data ?? []

  const retry = () => {
    scorersQ.refetch()
    teamsQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar la tabla de goleadores." onRetry={retry} />

  return (
    <div className="anim-up">
      <SectionHeader title="Tabla de Goleadores" />
      <div className="card" style={{ overflow: 'hidden' }}>
        {scorers.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 16px',
              borderBottom: i < scorers.length - 1 ? '1px solid #f1f5f9' : 'none',
              background: i === 0 ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafbfc',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = i === 0 ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafbfc')
            }
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: i === 0 ? AMBER : i < 3 ? '#dbeafe' : '#f1f5f9',
                color: i === 0 ? '#fff' : i < 3 ? NAVY : '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: teamColor(colors, s.team),
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: i === 0 ? '#0f172a' : '#334155' }}>
                {s.name}
                {s.withdrawn && (
                  <span
                    title="Equipo retirado del campeonato"
                    style={{ color: '#f59e0b', fontWeight: 800, marginLeft: 3, cursor: 'help' }}
                  >
                    *
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                {s.team}
                {s.withdrawn && (
                  <span style={{ color: '#f59e0b', marginLeft: 4, fontStyle: 'italic' }}>· retirado</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, color: i === 0 ? NAVY : '#0f172a', lineHeight: 1 }}>
                {s.goals}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>goles</div>
            </div>
          </div>
        ))}
        {scorers.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 24, margin: 0 }}>
            Sin goleadores registrados.
          </p>
        )}
      </div>
    </div>
  )
}
