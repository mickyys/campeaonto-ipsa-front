'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useBracket, useTeamColorMap, useTeams, EMPTY_COPAS } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import BracketCard, { type BracketQualifier } from '@/components/BracketCard'
import { SectionHeader, LoadingState, ErrorState, NAVY } from '@/components/ui'
import type { BracketCopaId, BracketMatch, BracketRound } from '@/lib/types'

const ROUNDS: { key: string; title: string; sub: string }[] = [
  { key: 'QF', title: 'Cuartos de Final', sub: 'Eliminación directa' },
  { key: 'SF', title: 'Semifinales', sub: 'Eliminación directa' },
  { key: 'FINAL', title: 'Final', sub: 'El campeón se corona aquí' },
]

const COPAS: { id: BracketCopaId; label: string; color: string; badge: string }[] = [
  { id: 'oro', label: 'Copa de Oro', color: '#d97706', badge: 'Campeón Copa de Oro' },
  { id: 'plata', label: 'Copa de Plata', color: '#64748b', badge: 'Campeón Copa de Plata' },
  { id: 'bronce', label: 'Copa de Bronce', color: '#b45309', badge: 'Campeón Copa de Bronce' },
]

function computeQualifiers(bracket: BracketRound[], roundIdx: number, matchIdx: number): BracketQualifier | undefined {
  if (roundIdx === 0) return undefined
  const prevRound = bracket[roundIdx - 1]
  if (!prevRound) return undefined
  const homeIdx = matchIdx * 2
  const awayIdx = matchIdx * 2 + 1
  const home = prevRound.matches[homeIdx]
  const away = prevRound.matches[awayIdx]
  return {
    home: home?.winner ?? `Ganador Partido ${homeIdx + 1}`,
    away: away?.winner ?? `Ganador Partido ${awayIdx + 1}`,
  }
}

export default function BracketView() {
  const teamsQ = useTeams()
  const bracketQ = useBracket()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [active, setActive] = useState<BracketCopaId>('oro')

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || bracketQ.isPending
  const error = teamsQ.error ?? bracketQ.error

  const teams = teamsQ.data ?? []
  const copas = bracketQ.data ?? EMPTY_COPAS

  const meta = COPAS.find((c) => c.id === active) ?? COPAS[0]
  const bracket = useMemo(() => copas[active] ?? [], [copas, active])
  const configured = bracket.some((round) => round.matches.some((m) => m.home || m.away))

  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [connectors, setConnectors] = useState<{ paths: string[]; width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const draw = () => {
      const container = gridRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const paths: string[] = []
      for (let ri = 0; ri < bracket.length - 1; ri++) {
        const next = bracket[ri + 1]
        for (let mi = 0; mi < next.matches.length; mi++) {
          const top = cardRefs.current.get(`${ri}-${mi * 2}`)
          const bottom = cardRefs.current.get(`${ri}-${mi * 2 + 1}`)
          const target = cardRefs.current.get(`${ri + 1}-${mi}`)
          if (!top || !bottom || !target) continue
          const t = top.getBoundingClientRect()
          const b = bottom.getBoundingClientRect()
          const g = target.getBoundingClientRect()
          const x0 = t.right - cRect.left
          const x1 = g.left - cRect.left
          const midX = (x0 + x1) / 2
          const topY = t.top + t.height / 2 - cRect.top
          const bottomY = b.top + b.height / 2 - cRect.top
          const targetY = g.top + g.height / 2 - cRect.top
          paths.push(`M ${x0} ${topY} L ${midX} ${topY} L ${midX} ${targetY}`)
          paths.push(`M ${x0} ${bottomY} L ${midX} ${bottomY} L ${midX} ${targetY}`)
          paths.push(`M ${midX} ${targetY} L ${x1} ${targetY}`)
        }
      }
      setConnectors({
        paths,
        width: container.scrollWidth,
        height: container.scrollHeight,
      })
    }
    draw()
    const ro = new ResizeObserver(draw)
    if (gridRef.current) ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [bracket])

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const openTeam = (team: string) => {
    const t = teams.find((x) => x.name === team)
    if (t && (t.players ?? []).length > 0) setSelectedTeam(team)
  }
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
            Copa de Oro, Plata y Bronce — haz clic en un equipo para ver su nómina.
          </p>
        </div>
        <div
          style={{
            background: meta.color,
            color: '#fff',
            borderRadius: 10,
            padding: '8px 14px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.85 }}>
            {meta.badge}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
            {bracket[bracket.length - 1]?.matches?.[0]?.winner ?? 'Por definir'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {COPAS.map((c) => {
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: '1.5px solid',
                borderColor: active === c.id ? c.color : '#e2e8f0',
                background: active === c.id ? c.color : '#fff',
                color: active === c.id ? '#fff' : '#334155',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: '.03em',
                textTransform: 'uppercase',
                transition: 'all .15s',
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {bracket.length === 0 || !configured ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          El bracket de {meta.label.toLowerCase()} se publicará cuando comiencen las eliminatorias.
        </div>
      ) : (
        <div
          ref={gridRef}
          style={{
            position: 'relative',
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {connectors && connectors.paths.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: connectors.width,
                height: connectors.height,
                pointerEvents: 'none',
                zIndex: 0,
              }}
              width={connectors.width}
              height={connectors.height}
            >
              <g stroke="#cbd5e1" strokeWidth={2} fill="none">
                {connectors.paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            </svg>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${bracket.length}, minmax(200px, 1fr))`,
              gap: 18,
              alignItems: 'start',
            }}
          >
            {bracket.map((round, ri) => {
              const rmeta = ROUNDS[ri] ?? { key: `R${ri + 1}`, title: `Ronda ${ri + 1}`, sub: '' }
              return (
                <div key={`${round.name ?? rmeta.key}`} style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: 12 }}>
                    <SectionHeader title={round.name || rmeta.title} />
                    {round.name && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{rmeta.sub}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {round.matches.map((m: BracketMatch, mi) => (
                      <div
                        key={m.id}
                        ref={(el) => {
                          if (el) cardRefs.current.set(`${ri}-${mi}`, el)
                          else cardRefs.current.delete(`${ri}-${mi}`)
                        }}
                      >
                        <BracketCard m={m} colors={colors} onTeamClick={openTeam} qualifier={computeQualifiers(bracket, ri, mi)} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
