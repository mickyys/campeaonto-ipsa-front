'use client'

import { useState } from 'react'
import { useBracket, useTeamColorMap, useTeams } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import BracketCard from '@/components/BracketCard'
import { SectionHeader, LoadingState, ErrorState, NAVY, AMBER } from '@/components/ui'
import type { BracketMatch } from '@/lib/types'

const ROUNDS: { key: string; title: string; sub: string }[] = [
  { key: 'QF', title: 'Cuartos de Final', sub: 'Eliminación directa' },
  { key: 'SF', title: 'Semifinales', sub: 'Eliminación directa' },
  { key: 'FINAL', title: 'Final', sub: 'El campeón se corona aquí' },
]

export default function BracketView() {
  const teamsQ = useTeams()
  const bracketQ = useBracket()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || bracketQ.isPending
  const error = teamsQ.error ?? bracketQ.error

  const teams = teamsQ.data ?? []
  const bracket = bracketQ.data ?? []

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const retry = () => {
    teamsQ.refetch()
    bracketQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar el bracket." onRetry={retry} />

  return (
    <div className="anim-up">
      {selected && <TeamModal team={selected} colors={colors} onClose={() => setSelectedTeam(null)} />}

      <div
        className="card hero-pattern"
        style={{
          padding: '20px 24px',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          borderTop: `4px solid ${NAVY}`,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 30, textTransform: 'uppercase', color: NAVY, lineHeight: 1.1 }}>
            Fase de Eliminación
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            {bracket.length === 3 ? 'Cuartos · Semifinales · Final' : 'Bracket del torneo'} — haz clic en un equipo para ver su nómina.
          </p>
        </div>
        <div
          style={{
            background: AMBER,
            color: '#fff',
            borderRadius: 10,
            padding: '8px 14px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.85 }}>Campeón 2025</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
            {bracket[2]?.[0]?.winner ?? 'Por definir'}
          </div>
        </div>
      </div>

      {bracket.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          El bracket se publicará cuando comiencen las eliminatorias.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${bracket.length}, minmax(200px, 1fr))`,
            gap: 18,
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {bracket.map((round, ri) => {
            const meta = ROUNDS[ri] ?? { key: `R${ri + 1}`, title: `Ronda ${ri + 1}`, sub: '' }
            return (
              <div key={meta.key}>
                <div style={{ marginBottom: 12 }}>
                  <SectionHeader title={meta.title} />
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{meta.sub}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {round.map((m: BracketMatch) => (
                    <BracketCard key={m.id} m={m} colors={colors} onTeamClick={setSelectedTeam} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
