'use client'

import type { BracketMatch } from '@/lib/types'
import { teamColor } from '@/lib/hooks'
import { NAVY } from '@/components/ui'

export interface BracketQualifier {
  home?: string
  away?: string
}

export default function BracketCard({
  m,
  colors,
  onTeamClick,
  qualifier,
  matchLabel,
}: {
  m: BracketMatch
  colors: Map<string, string>
  onTeamClick?: (team: string) => void
  qualifier?: BracketQualifier
  matchLabel?: string
}) {
  const renderRow = (
    team: string | null,
    color: string,
    score?: number,
    isBottom = false,
    qual?: string,
  ) => {
    const won = team && m.winner === team
    const isQualifier = !team && !!qual
    const label = team ?? qual ?? 'TBD'
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
            fontSize: isQualifier ? 12 : 13,
            fontWeight: isQualifier ? 500 : 600,
            fontStyle: isQualifier ? 'italic' : 'normal',
            color: isQualifier ? '#94a3b8' : won ? NAVY : team ? '#475569' : '#cbd5e1',
            cursor: onTeamClick && team ? 'pointer' : 'default',
            transition: 'text-decoration .1s',
          }}
          onMouseEnter={(e) => onTeamClick && team && (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => onTeamClick && team && (e.currentTarget.style.textDecoration = 'none')}
          onClick={() => onTeamClick?.(team!)}
        >
          {label}
        </span>
        {score !== undefined && team !== null && (
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
      {matchLabel && (
        <div
          style={{
            padding: '3px 12px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: '#64748b',
          }}
        >
          {matchLabel}
        </div>
      )}
      {renderRow(m.home, m.home ? teamColor(colors, m.home) : '#e2e8f0', m.homeScore, false, qualifier?.home)}
      {renderRow(m.away, m.away ? teamColor(colors, m.away) : '#e2e8f0', m.awayScore, true, qualifier?.away)}
    </div>
  )
}
