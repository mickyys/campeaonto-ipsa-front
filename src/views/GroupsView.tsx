'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useGroups, useStandings, useTeamColorMap, useTeams, pts, gd } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import { SectionHeader, LoadingState, ErrorState, NAVY, AMBER } from '@/components/ui'

export default function GroupsView() {
  const teamsQ = useTeams()
  const groupsQ = useGroups()
  const standingsQ = useStandings()
  const [tab, setTab] = useState<'A' | 'B' | 'C'>('A')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || groupsQ.isPending || standingsQ.isPending
  const error = teamsQ.error ?? groupsQ.error ?? standingsQ.error

  const teams = teamsQ.data ?? []
  const groups = groupsQ.data ?? []
  const standings = standingsQ.data ?? {}
  const currentGroup = groups.find((g) => g.label === tab)
  const teamNames = currentGroup ? currentGroup.teamIds.map((id) => teams.find((t) => t.id === id)).filter(Boolean).map((t) => t!.name) : []
  const sorted = [...(standings[tab] ?? [])].sort((a, b) => pts(b) - pts(a) || gd(b) - gd(a) || b.gf - a.gf)

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const openTeam = (team: string) => {
    const t = teams.find((x) => x.name === team)
    if (t && (t.players ?? []).length > 0) setSelectedTeam(team)
  }
  const retry = () => {
    teamsQ.refetch()
    groupsQ.refetch()
    standingsQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar las tablas de posiciones." onRetry={retry} />

  return (
    <div className="anim-up">
      {selected && <TeamModal team={selected} colors={colors} onClose={() => setSelectedTeam(null)} />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['A', 'B', 'C'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setTab(g)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1.5px solid',
              borderColor: tab === g ? NAVY : '#e2e8f0',
              background: tab === g ? NAVY : '#fff',
              color: tab === g ? '#fff' : '#64748b',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all .15s',
              letterSpacing: '.02em',
            }}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image src="/ipsa-logo.png" alt="IPSA" width={36} height={36} style={{ objectFit: 'contain' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Tabla de Posiciones — Grupo {tab}</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Campeonato Apoderados IPSA San Antonio 2026 · Estadísticas actualizadas</p>
          </div>
          <div style={{ marginLeft: 'auto', background: NAVY, color: '#fff', borderRadius: 8, padding: '6px 14px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.75 }}>GRUPO</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 24, lineHeight: 1 }}>{tab}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="standings-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20, width: 36 }}>POS</th>
                <th style={{ minWidth: 170 }}>EQUIPO</th>
                <th>PJ</th>
                <th>PG</th>
                <th>PE</th>
                <th>PP</th>
                <th>GF</th>
                <th>GC</th>
                <th>DIFF</th>
                <th style={{ color: NAVY }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.team} className={i < 2 ? 'top' : ''} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ paddingLeft: 20 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: i === 0 ? AMBER : i < 2 ? '#dbeafe' : '#f1f5f9',
                        color: i === 0 ? '#fff' : i < 2 ? NAVY : '#94a3b8',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div
                      onClick={() => openTeam(s.team)}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const name = e.currentTarget.querySelector<HTMLElement>('[data-team-name]')
                        if (name) name.style.textDecoration = 'underline'
                      }}
                      onMouseLeave={(e) => {
                        const name = e.currentTarget.querySelector<HTMLElement>('[data-team-name]')
                        if (name) name.style.textDecoration = 'none'
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors.get(s.team) ?? '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                      <span
                        data-team-name
                        style={{
                          fontWeight: i < 2 ? 700 : 500,
                          color: i < 2 ? NAVY : '#475569',
                          fontSize: 13.5,
                          textDecoration: 'none',
                          transition: 'text-decoration .1s',
                        }}
                      >
                        {s.team}
                      </span>
                      {i < 2 && (
                        <span style={{ fontSize: 10, background: '#dbeafe', color: NAVY, borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                          Clasifica
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: '#cbd5e1', marginLeft: 2 }}>👥</span>
                    </div>
                  </td>
                  <td>{s.pj}</td>
                  <td style={{ fontWeight: s.g > 0 ? 600 : 400 }}>{s.g}</td>
                  <td>{s.e}</td>
                  <td>{s.p}</td>
                  <td>{s.gf}</td>
                  <td>{s.gc}</td>
                  <td style={{ fontWeight: 600, color: gd(s) > 0 ? '#16a34a' : gd(s) < 0 ? '#dc2626' : '#94a3b8' }}>
                    {gd(s) > 0 ? '+' : ''}
                    {gd(s)}
                  </td>
                  <td style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, color: i < 2 ? NAVY : '#0f172a' }}>
                    {pts(s)}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                    No hay partidos jugados en este grupo todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Organiza: Centro de Padres IPSA SAI · Estadísticas Fecha 6</span>
          <a href="mailto:centrodepadresipsasai@gmail.com" style={{ fontSize: 11, color: NAVY, textDecoration: 'none', fontWeight: 500 }}>
            centrodepadresipsasai@gmail.com
          </a>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <SectionHeader title={`Equipos del Grupo ${tab}`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px,1fr))', gap: 10 }}>
          {teamNames.map((team) => {
            const t = teams.find((x) => x.name === team)!
            const color = colors.get(team) ?? '#64748b'
            return (
              <div
                key={team}
                className="card card-hover"
                onClick={() => openTeam(team)}
                style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: `${color}18`,
                    border: `1.5px solid ${color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>{team}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{(t.players ?? []).length} jugadores</div>
                </div>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>›</span>
              </div>
            )
          })}
          {teamNames.length === 0 && (
            <p style={{ gridColumn: '1 / -1', fontSize: 13, color: '#94a3b8' }}>Este grupo aún no tiene equipos asignados.</p>
          )}
        </div>
      </div>
    </div>
  )
}
