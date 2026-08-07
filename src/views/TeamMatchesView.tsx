'use client'

import { useMemo, useState } from 'react'
import { useGroups, useMatches, useStandings, useTeamColorMap, useTeams, pts } from '@/lib/hooks'
import MatchCard from '@/components/MatchCard'
import { SectionHeader, LoadingState, ErrorState, NAVY } from '@/components/ui'

function Stat({ label, value, strong }: { label: string; value: number | string; strong?: boolean }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 34 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: strong ? NAVY : '#94a3b8',
          letterSpacing: '.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 800,
          fontSize: strong ? 22 : 18,
          color: strong ? NAVY : '#0f172a',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function TeamMatchesView() {
  const teamsQ = useTeams()
  const matchesQ = useMatches()
  const groupsQ = useGroups()
  const standingsQ = useStandings()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || matchesQ.isPending || groupsQ.isPending
  const error = teamsQ.error ?? matchesQ.error ?? groupsQ.error

  const standings = standingsQ.data ?? {}

  const groupOf = useMemo(() => {
    const m = new Map<string, string>()
    for (const g of groupsQ.data ?? []) for (const id of g.teamIds) m.set(id, g.label)
    return m
  }, [groupsQ.data])

  const sortedTeams = useMemo(
    () =>
      [...(teamsQ.data ?? [])].sort(
        (a, b) =>
          (groupOf.get(a.id) ?? '~').localeCompare(groupOf.get(b.id) ?? '~', undefined, { numeric: true }) ||
          a.name.localeCompare(b.name, undefined, { numeric: true }),
      ),
    [teamsQ.data, groupOf],
  )

  const activeName = selectedTeam ?? sortedTeams[0]?.name ?? null
  const team = activeName ? (teamsQ.data ?? []).find((t) => t.name === activeName) : null

  const teamMatches = useMemo(
    () =>
      (matchesQ.data ?? []).filter((m) => activeName && (m.homeTeam === activeName || m.awayTeam === activeName)),
    [matchesQ.data, activeName],
  )

  const played = useMemo(
    () =>
      teamMatches
        .filter((m) => m.status === 'completed')
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [teamMatches],
  )

  const pending = useMemo(
    () =>
      teamMatches
        .filter((m) => m.status !== 'completed')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [teamMatches],
  )

  const groupLabel = team ? groupOf.get(team.id) : null
  const groupRows = groupLabel ? standings[groupLabel] ?? [] : []
  const standing = groupRows.find((s) => s.team === activeName)
  const position = standing ? groupRows.indexOf(standing) + 1 : null

  const switchTeam = (name: string) => setSelectedTeam(name)

  if (loading) return <LoadingState />
  if (error)
    return (
      <ErrorState
        message="No pudimos cargar los partidos del equipo."
        onRetry={() => {
          teamsQ.refetch()
          matchesQ.refetch()
          groupsQ.refetch()
          standingsQ.refetch()
        }}
      />
    )

  const color = team ? colors.get(team.name) ?? NAVY : NAVY

  return (
    <div className="anim-up">
      <SectionHeader title="Partidos por Equipo" />

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Selecciona un equipo
        </label>
        <select
          value={activeName ?? ''}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid #e2e8f0',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: '#0f172a',
            background: '#fff',
            outline: 'none',
          }}
        >
          {sortedTeams.map((t) => (
            <option key={t.id} value={t.name}>
              {groupOf.get(t.id) ? `Grupo ${groupOf.get(t.id)} · ` : ''}
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {team ? (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
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
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: color, display: 'inline-block' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{team.name}</div>
                {groupLabel && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Grupo {groupLabel}
                    {position ? ` · Posición ${position}${groupRows.length ? ` de ${groupRows.length}` : ''}` : ''}
                  </div>
                )}
              </div>
              {standing && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <Stat label="PJ" value={standing.pj} />
                  <Stat label="PG" value={standing.g} />
                  <Stat label="PE" value={standing.e} />
                  <Stat label="PP" value={standing.p} />
                  <Stat label="GF" value={standing.gf} />
                  <Stat label="GC" value={standing.gc} />
                  <Stat label="PTS" value={pts(standing)} strong />
                </div>
              )}
            </div>
          </div>

          <SectionHeader title={`Partidos jugados ${played.length > 0 ? `(${played.length})` : ''}`} />
          {played.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>
              Aún no hay partidos jugados.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {played.map((m) => (
                <MatchCard key={m.id} m={m} colors={colors} onTeamClick={switchTeam} />
              ))}
            </div>
          )}

          <SectionHeader title={`Partidos pendientes ${pending.length > 0 ? `(${pending.length})` : ''}`} />
          {pending.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No quedan partidos pendientes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.map((m) => (
                <MatchCard key={m.id} m={m} colors={colors} onTeamClick={switchTeam} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          Hay equipos para ver.
        </div>
      )}
    </div>
  )
}