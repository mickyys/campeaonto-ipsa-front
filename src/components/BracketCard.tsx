'use client'

import type { BracketMatch } from '@/lib/types'
import { teamColor } from '@/lib/hooks'
import { NAVY } from '@/components/ui'

export default function BracketCard({
  m,
  colors,
  onTeamClick,
}: {
  m: BracketMatch
  colors: Map<string, string>
  onTeamClick?: (team: string) => void
}) {
  const renderRow = (
    team: string | null,
    color: string,
    score?: number,
    isBottom = false,
  ) => {
    const won = team && m.winner === team
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: !isBottom ? '1px solid #f1f5f9' : 'none',
          background: won ? '#eff6ff' : 'transparent',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: team ? color : '#e2e8f0',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: won ? NAVY : team ? '#475569' : '#cbd5e1',
            cursor: onTeamClick && team ? 'pointer' : 'default',
            transition: 'text-decoration .1s',
          }}
          onMouseEnter={(e) => onTeamClick && team && (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => onTeamClick && team && (e.currentTarget.style.textDecoration = 'none')}
          onClick={() => onTeamClick?.(team!)}
        >
          {team ?? 'TBD'}
        </span>
        {score !== undefined && (
          <span
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: won ? NAVY : '#94a3b8',
            }}
          >
            {score}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 10,
        overflow: 'hidden',
        minWidth: 200,
        boxShadow: '0 1px 4px rgba(15,23,42,.06)',
      }}
    >
      {renderRow(m.home, m.home ? teamColor(colors, m.home) : '#e2e8f0', m.homeScore)}
      {renderRow(m.away, m.away ? teamColor(colors, m.away) : '#e2e8f0', m.awayScore, true)}
    </div>
  )
}
