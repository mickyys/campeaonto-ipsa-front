'use client'

import type { Match } from '@/lib/types'
import { formatDate, teamColor } from '@/lib/hooks'
import { GroupBadge, NAVY } from '@/components/ui'

export default function MatchCard({
  m,
  colors,
  onTeamClick,
  badgeLabel,
}: {
  m: Match
  colors: Map<string, string>
  onTeamClick?: (team: string) => void
  badgeLabel?: string
}) {
  const done = m.status === 'completed'
  const hw = done && (m.homeScore ?? 0) > (m.awayScore ?? 0)
  const aw = done && (m.awayScore ?? 0) > (m.homeScore ?? 0)
  const draw = done && m.homeScore === m.awayScore
  const hc = teamColor(colors, m.homeTeam)
  const ac = teamColor(colors, m.awayTeam)
  const homeTurno = m.referee === m.homeTeam
  const awayTurno = m.referee === m.awayTeam

  return (
    <div
      className="card card-hover"
      style={{ padding: '12px 16px', position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: '14px 0 0 14px',
          background: done ? (draw ? '#94a3b8' : hw ? hc : ac) : '#bfdbfe',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 9,
          paddingLeft: 6,
        }}
      >
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
          {formatDate(m.date)} · {m.time}
          {m.referee ? (
            <>
              {' · '}
              <span style={{ color: '#b45309', fontWeight: 700 }}>Turno: {m.referee}</span>
            </>
          ) : null}
        </span>
        <GroupBadge group={m.group} label={badgeLabel} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: hc,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: hw ? '#0f172a' : done ? '#94a3b8' : '#0f172a',
            cursor: onTeamClick ? 'pointer' : 'default',
            transition: 'text-decoration .1s',
          }}
          onMouseEnter={(e) => onTeamClick && (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => onTeamClick && (e.currentTarget.style.textDecoration = 'none')}
          onClick={() => onTeamClick?.(m.homeTeam)}
        >
          {m.homeTeam}
        </span>
        {homeTurno && (
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              background: '#fef3c7',
              color: '#b45309',
              borderRadius: 4,
              padding: '1px 5px',
              letterSpacing: '.05em',
              flexShrink: 0,
            }}
          >
            TURNO
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {done ? (
            <>
              <span
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: hw ? NAVY : '#cbd5e1',
                  lineHeight: 1,
                }}
              >
                {m.homeScore}
              </span>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>–</span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: aw ? NAVY : '#cbd5e1',
                  lineHeight: 1,
                }}
              >
                {m.awayScore}
              </span>
            </>
          ) : (
            <span
              style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', letterSpacing: '.06em' }}
            >
              VS
            </span>
          )}
        </div>
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'right',
            color: aw ? '#0f172a' : done ? '#94a3b8' : '#0f172a',
            cursor: onTeamClick ? 'pointer' : 'default',
            transition: 'text-decoration .1s',
          }}
          onMouseEnter={(e) => onTeamClick && (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => onTeamClick && (e.currentTarget.style.textDecoration = 'none')}
          onClick={() => onTeamClick?.(m.awayTeam)}
        >
          {m.awayTeam}
        </span>
        {awayTurno && (
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              background: '#fef3c7',
              color: '#b45309',
              borderRadius: 4,
              padding: '1px 5px',
              letterSpacing: '.05em',
              flexShrink: 0,
            }}
          >
            TURNO
          </span>
        )}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ac,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}
