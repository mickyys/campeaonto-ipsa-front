'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useGeneralStanding, useTeamColorMap, useTeams, pts, gd } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import { SectionHeader, LoadingState, ErrorState, NAVY, AMBER, CupIcon } from '@/components/ui'
import type { CopaClassification } from '@/lib/types'

const COPAS = [
  { key: 'oro', label: 'Copa de Oro', color: '#d97706', desc: '8 equipos · 1° y 2° de cada grupo, más los 2 mejores terceros' },
  { key: 'plata', label: 'Copa de Plata', color: '#64748b', desc: '8 equipos · peor tercero, 4° y 5° de cada grupo, y el mejor 6°' },
  { key: 'bronce', label: 'Copa de Bronce', color: '#b45309', desc: '4 equipos · 2 sextos restantes y los 2 mejores 7°' },
] as const

export default function StandingsView() {
  const genQ = useGeneralStanding()
  const teamsQ = useTeams()
  const colors = useTeamColorMap(teamsQ.data)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const loading = genQ.isPending || teamsQ.isPending
  const error = genQ.error ?? teamsQ.error

  const teams = teamsQ.data ?? []
  const data = genQ.data

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const openTeam = (team: string) => {
    const t = teams.find((x) => x.name === team)
    if (t && (t.players ?? []).length > 0) setSelectedTeam(team)
  }
  const retry = () => {
    genQ.refetch()
    teamsQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar la tabla general." onRetry={retry} />

  const table = data?.table ?? []
  const copas = data?.copas ?? ({} as CopaClassification)

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
            Tabla General
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            Ranking global de la fase de grupos y clasificación a las Copas — haz clic en un equipo para ver su nómina.
          </p>
        </div>
        {table[0] && (
          <div style={{ background: AMBER, color: '#fff', borderRadius: 10, padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.85 }}>
              Líder General
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
              {table[0].team}
            </div>
          </div>
        )}
      </div>

      <SectionHeader title="Clasificación a las Copas" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 12, marginBottom: 26 }}>
        {COPAS.map((c) => {
          const list = copas[c.key]
          return (
            <div key={c.key} className="card card-hover" style={{ padding: '14px 16px', borderTop: `3px solid ${c.color}`, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CupIcon color={c.color} size={15} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, textTransform: 'uppercase', letterSpacing: '.03em', color: NAVY }}>
                  {c.label}
                </span>
              </div>
              <p style={{ margin: '2px 0 10px', fontSize: 11, color: '#94a3b8' }}>{c.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {list.map((team) => (
                  <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.get(team) ?? '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{team}</span>
                  </div>
                ))}
                {list.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8' }}>Por definir al terminar la fase de grupos.</span>}
              </div>
            </div>
          )
        })}
        <div className="card" style={{ padding: '14px 16px', borderTop: '3px solid #94a3b8', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, opacity: 0.6 }}>🚫</span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, textTransform: 'uppercase', letterSpacing: '.03em', color: '#475569' }}>
              Eliminados
            </span>
          </div>
          <p style={{ margin: '2px 0 10px', fontSize: 11, color: '#94a3b8' }}>El peor 7° lugar no clasifica.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {copas.eliminado.map((team) => (
              <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.get(team) ?? '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{team}</span>
              </div>
            ))}
            {copas.eliminado.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8' }}>Por definir al terminar la fase de grupos.</span>}
          </div>
        </div>
      </div>

      <SectionHeader title="Tabla General de Posiciones" />
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image src="/ipsa-logo.png" alt="IPSA" width={34} height={34} style={{ objectFit: 'contain' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Todos los equipos</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Campeonato Apoderados IPSA San Antonio 2026 · Orden: PTS → dif. de goles → goles a favor</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="standings-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20, width: 36 }}>POS</th>
                <th style={{ minWidth: 170 }}>EQUIPO</th>
                <th>GRUPO</th>
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
              {table.map((s, i) => {
                const copa = badgeFor(copas, s.team)
                const retired = s.active === false
                return (
                  <tr
                    key={s.team}
                    style={{
                      background: retired ? '#f8fafc' : i % 2 === 0 ? '#fff' : '#fafbfc',
                      opacity: retired ? 0.72 : 1,
                    }}
                  >
                    <td style={{ paddingLeft: 20 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: i === 0 ? AMBER : i < 3 ? '#dbeafe' : '#f1f5f9',
                          color: i === 0 ? '#fff' : i < 3 ? NAVY : '#94a3b8',
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
                          const el = e.currentTarget.querySelector<HTMLElement>('[data-team-nameg]')
                          if (el) el.style.textDecoration = 'underline'
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget.querySelector<HTMLElement>('[data-team-nameg]')
                          if (el) el.style.textDecoration = 'none'
                        }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors.get(s.team) ?? '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                        <span data-team-nameg style={{ fontWeight: 600, color: '#334155', fontSize: 13.5, textDecoration: 'none', transition: 'text-decoration .1s' }}>
                          {s.team}
                        </span>
                        {retired && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              letterSpacing: '.05em',
                              textTransform: 'uppercase',
                              color: '#dc2626',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: 5,
                              padding: '1px 6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Retirado
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {copa ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 5,
                            background: `${copa.color}14`,
                            color: copa.color,
                            letterSpacing: '.03em',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {copa.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                      )}
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
                    <td style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, color: i < 3 ? NAVY : '#0f172a' }}>
                      {pts(s)}
                    </td>
                  </tr>
                )
              })}
              {table.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                    Sin partidos jugados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function badgeFor(copas: CopaClassification, team: string): { key: string; label: string; color: string } | null {
  for (const c of COPAS) {
    if (copas[c.key].includes(team)) return { key: c.key, label: c.label, color: c.color }
  }
  return null
}