'use client'

import { useMemo, useState } from 'react'
import { useFreeTeams, useMatches, useTeamColorMap, useTeams, formatDateLong, useBracket, EMPTY_COPAS } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import MatchCard from '@/components/MatchCard'
import { SectionHeader, LoadingState, ErrorState } from '@/components/ui'
import type { Bracket, BracketCopaId, Match } from '@/lib/types'

const COPA_LABELS: Record<BracketCopaId, string> = {
  oro: 'Oro',
  plata: 'Plata',
  bronce: 'Bronce',
}

const ROUND_FALLBACK = ['Cuartos', 'Semifinal', 'Final']

function roundLabel(bracket: Bracket, ri: number): string {
  const r = bracket[ri]
  if (r?.name) return r.name
  if (bracket.length === 2) return ri === 0 ? 'Semifinal' : 'Final'
  return ROUND_FALLBACK[ri] ?? `Ronda ${ri + 1}`
}

function toMatch(m: NonNullable<Bracket[number]['matches'][number]>): Match {
  return {
    id: m.id,
    homeTeam: m.home ?? 'Por definir',
    awayTeam: m.away ?? 'Por definir',
    date: m.date ?? '',
    time: m.time ?? '',
    group: 'E',
    cancha: m.cancha ?? '1',
    referee: m.referee,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status === 'completed' ? 'completed' : 'upcoming',
  }
}

export default function FixtureView() {
  const teamsQ = useTeams()
  const matchesQ = useMatches()
  const freeTeamsQ = useFreeTeams()
  const bracketQ = useBracket()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || matchesQ.isPending || freeTeamsQ.isPending || bracketQ.isPending
  const error = teamsQ.error ?? matchesQ.error ?? freeTeamsQ.error ?? bracketQ.error

  const teams = teamsQ.data ?? []
  const matches = matchesQ.data ?? []
  const freeTeams = freeTeamsQ.data ?? []

  const nameOf = (id: string) => teams.find((t) => t.id === id)?.name ?? id

  const byDate = useMemo(() => {
    const all: { match: Match; badge?: string }[] = []
    for (const m of matchesQ.data ?? []) all.push({ match: m })
    for (const [copaId, bracket] of Object.entries(bracketQ.data ?? EMPTY_COPAS)) {
      bracket.forEach((round, ri) => {
        const badge = `${COPA_LABELS[copaId as BracketCopaId]} · ${roundLabel(bracket, ri)}`
        for (const m of round.matches) {
          if (!m.date || (!m.home && !m.away)) continue
          all.push({ match: toMatch(m), badge })
        }
      })
    }
    all.sort((a, b) => (b.match.date + b.match.time).localeCompare(a.match.date + a.match.time))
    const map = new Map<string, { match: Match; badge?: string }[]>()
    for (const item of all) {
      const list = map.get(item.match.date) ?? []
      list.push(item)
      map.set(item.match.date, list)
    }
    return map
  }, [matchesQ.data, bracketQ.data])

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const openTeam = (team: string) => {
    const t = teams.find((x) => x.name === team)
    if (t && (t.players ?? []).length > 0) setSelectedTeam(team)
  }
  const retry = () => {
    teamsQ.refetch()
    matchesQ.refetch()
    freeTeamsQ.refetch()
    bracketQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar el fixture." onRetry={retry} />

  return (
    <div className="anim-up">
      {selected && <TeamModal team={selected} colors={colors} onClose={() => setSelectedTeam(null)} />}

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#bfdbfe', display: 'inline-block' }} />
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Próximo partido</span>
        <span style={{ width: 1, height: 14, background: '#e2e8f0', display: 'inline-block' }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>Haz clic en un equipo para ver su nómina.</span>
      </div>

      {matches.length === 0 && byDate.size === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          El fixture se publicará pronto.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {[...byDate.entries()].map(([date, list], di) => {
            const free = freeTeams.find((f) => f.id === date)
            return (
              <section key={date}>
                <SectionHeader title={formatDateLong(date)} />
                {free && Object.keys(free.byGroup).length > 0 && (
                  <div
                    className="card"
                    style={{ padding: '8px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a', letterSpacing: '.05em' }}>
                      EQUIPOS LIBRES
                    </span>
                    {Object.entries(free.byGroup).map(([g, ids]) => (
                      <span key={g} style={{ fontSize: 12, color: '#64748b' }}>
                        <b style={{ color: '#334155' }}>{g}:</b>{' '}
                        {ids.map((id) => nameOf(id)).join(' · ')}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map(({ match: m, badge }) => (
                    <MatchCard key={m.id} m={m} colors={colors} onTeamClick={openTeam} badgeLabel={badge} />
                  ))}
                </div>
                {di === 0 && list.some(({ match: m }) => m.status === 'upcoming') && (
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Última actualización: hoy · Estadísticas en vivo</p>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}