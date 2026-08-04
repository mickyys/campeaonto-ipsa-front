'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useBracket, useGroups, useMatches, useScorers, useStandings, useTeamColorMap, useTeams, teamColor, formatDate, hasBracketConfigured } from '@/lib/hooks'
import TeamModal from '@/components/TeamModal'
import MatchCard from '@/components/MatchCard'
import { SectionHeader, TeamPill, LoadingState, ErrorState, NAVY, AMBER, GREEN } from '@/components/ui'

export default function HomeView() {
  const router = useRouter()
  const teamsQ = useTeams()
  const groupsQ = useGroups()
  const matchesQ = useMatches()
  const standingsQ = useStandings()
  const scorersQ = useScorers()
  const bracketQ = useBracket()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const colors = useTeamColorMap(teamsQ.data)
  const loading = teamsQ.isPending || groupsQ.isPending || matchesQ.isPending || standingsQ.isPending || scorersQ.isPending
  const error = teamsQ.error ?? groupsQ.error ?? matchesQ.error ?? standingsQ.error ?? scorersQ.error

  const teams = teamsQ.data ?? []
  const groups = groupsQ.data ?? []
  const standings = standingsQ.data ?? {}
  const scorers = scorersQ.data ?? []

  const upcoming = useMemo(
    () =>
      (matchesQ.data ?? [])
        .filter((m) => m.status === 'upcoming')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [matchesQ.data],
  )
  const recent = useMemo(
    () =>
      (matchesQ.data ?? [])
        .filter((m) => m.status === 'completed')
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [matchesQ.data],
  )
  const lastDate = recent[0]?.date
  const lastDateMatches = lastDate ? recent.filter((m) => m.date === lastDate) : []

  const today = useMemo(() => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }, [])
  const nextFecha = upcoming.find((m) => m.date >= today)?.date
  const nextFechaMatches = nextFecha ? upcoming.filter((m) => m.date === nextFecha) : []

  const stats = useMemo(
    () => [
      { v: String(teamsQ.data?.length || 0), l: 'Equipos' },
      { v: String(groupsQ.data?.length || 0), l: 'Grupos' },
      { v: String(matchesQ.data?.length || 0), l: 'Partidos' },
      { v: String(new Set((matchesQ.data ?? []).map((m) => m.date)).size || 0), l: 'Fechas' },
    ],
    [teamsQ.data, groupsQ.data, matchesQ.data],
  )

  const selected = selectedTeam ? teams.find((t) => t.name === selectedTeam) : null
  const topScorer = scorers[0]
  const retry = () => {
    teamsQ.refetch()
    groupsQ.refetch()
    matchesQ.refetch()
    standingsQ.refetch()
    scorersQ.refetch()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No pudimos cargar la información del campeonato." onRetry={retry} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {selected && <TeamModal team={selected} colors={colors} onClose={() => setSelectedTeam(null)} />}

      {/* Hero */}
      <div
        className="card hero-pattern anim-up"
        style={{
          padding: 'clamp(24px,5vw,48px)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: `4px solid ${NAVY}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(16px,4vw,40px)',
            flexWrap: 'wrap',
          }}
        >
          <Image
            src="/ipsa-logo.png"
            alt="Instituto del Puerto"
            width={96}
            height={96}
            style={{
              width: 'clamp(64px,10vw,96px)',
              height: 'clamp(64px,10vw,96px)',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: GREEN,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: GREEN,
                  fontWeight: 700,
                  letterSpacing: '.05em',
                  textTransform: 'uppercase',
                }}
              >
                Torneo en curso
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Desde 30 mayo 2026</span>
            </div>

            <h1
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(32px,6vw,60px)',
                lineHeight: 0.95,
                letterSpacing: '-.01em',
                textTransform: 'uppercase',
                margin: '0 0 4px',
                color: NAVY,
              }}
            >
              Campeonato
              <br />
              <span style={{ color: AMBER }}>Apoderados</span>
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 6px', fontWeight: 500 }}>
              Instituto del Puerto San Antonio · Edición 2026
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px,1fr))',
                gap: 12,
                maxWidth: 480,
                margin: '16px 0 20px',
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.l}
                  style={{
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: '10px 8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed',sans-serif",
                      fontWeight: 800,
                      fontSize: 26,
                      color: NAVY,
                      lineHeight: 1,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      fontWeight: 600,
                      marginTop: 2,
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '11px 22px', fontSize: 13 }} onClick={() => router.push('/fixture')}>
                Ver Fixture
              </button>
              <button className="btn-secondary" style={{ padding: '11px 22px', fontSize: 13 }} onClick={() => router.push('/grupos')}>
                Tabla de Grupos
              </button>
              {hasBracketConfigured(bracketQ.data) && (
                <button className="btn-secondary" style={{ padding: '11px 22px', fontSize: 13 }} onClick={() => router.push('/bracket')}>
                  Eliminatorias
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card anim-up-1" style={{ padding: '20px 24px', borderLeft: `4px solid ${AMBER}` }}>
        <p style={{ margin: 0, fontSize: 13.5, color: '#475569', lineHeight: 1.65, fontWeight: 400 }}>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Campeonato de Apoderados IPSA SAI</span> — Una actividad
          recreativa organizada por el Centro de Padres, con el objetivo de fortalecer los lazos entre las familias y la
          comunidad escolar, promoviendo el compañerismo, la participación activa y el deporte. A través del juego,
          buscamos generar un ambiente de cercanía, respeto y colaboración entre los apoderados, docentes y estudiantes.
        </p>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Consultas:</span>
          <a href="mailto:centrodepadresipsasai@gmail.com" style={{ fontSize: 12, color: NAVY, textDecoration: 'none', fontWeight: 600 }}>
            centrodepadresipsasai@gmail.com
          </a>
        </div>
      </div>

      {/* Groups overview */}
      <div className="anim-up-2">
        <SectionHeader title="Posiciones por Grupo" action="Ver completo" onAction={() => router.push('/grupos')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 12 }}>
          {groups.map((g) => {
            const rows = standings[g.label] ?? []
            return (
              <div key={g.id} className="card card-hover" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => router.push('/grupos')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        background: NAVY,
                        color: '#fff',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      Grupo {g.label}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{g.teamIds.length} equipos</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rows.slice(0, 3).map((s, i) => (
                    <div
                      key={s.team}
                      onClick={(e) => {
                        e.stopPropagation()
                        const t = teams.find((x) => x.name === s.team)
                        if (t && (t.players ?? []).length > 0) setSelectedTeam(s.team)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '3px 6px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        margin: '0 -6px',
                        transition: 'background .12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: 11, color: i === 0 ? AMBER : '#94a3b8', fontWeight: 700, width: 14, textAlign: 'center' }}>
                        {i + 1}
                      </span>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: teamColor(colors, s.team),
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: i < 2 ? 600 : 400, color: i < 2 ? '#334155' : '#94a3b8' }}>
                        {s.team}
                      </span>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, color: i === 0 ? NAVY : '#64748b' }}>
                        {s.g * 3 + s.e}
                      </span>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sin partidos jugados.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bento: Upcoming (full width, 2 col) */}
      <div className="bento anim-up-3">
        <div className="span-12">
          <SectionHeader title="Próximos Partidos" action="Ver todos" onAction={() => router.push('/fixture')} />
          {nextFechaMatches.length > 0 && (
            <div style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginBottom: 8 }}>
              Próxima fecha · {formatDate(nextFecha)}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 8 }}>
            {nextFechaMatches.map((m) => (
              <MatchCard key={m.id} m={m} colors={colors} />
            ))}
            {nextFechaMatches.length === 0 && (
              <p className="card" style={{ padding: 24, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                No hay partidos programados.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bento: Scorer stacked over scorers table + Results */}
      <div className="bento anim-up-4">
        <div className="span-6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <SectionHeader title="Goleador Destacado" />
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: 22,
                }}
              >
                ⚽
              </div>
              {topScorer ? (
                <>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 52, color: NAVY, lineHeight: 1 }}>
                    {topScorer.goals}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      margin: '2px 0 8px',
                    }}
                  >
                    Goles
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 3 }}>{topScorer.name}</div>
                  <TeamPill team={topScorer.team} colors={colors} />
                </>
              ) : (
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Sin datos por ahora</p>
              )}
            </div>
          </div>

          <div>
            <SectionHeader title="Tabla de Goleadores" />
            <div className="card" style={{ overflow: 'hidden' }}>
              {scorers.slice(0, 5).map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 16px',
                    borderBottom: i < 4 ? '1px solid #f8fafc' : 'none',
                    background: i === 0 ? '#eff6ff' : 'transparent',
                    transition: 'background .15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i === 0 ? '#eff6ff' : 'transparent')}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: i === 0 ? AMBER : i < 3 ? '#dbeafe' : '#f1f5f9',
                      color: i === 0 ? '#fff' : i < 3 ? NAVY : '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: teamColor(colors, s.team),
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: i === 0 ? '#0f172a' : '#334155' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.team}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, color: i === 0 ? NAVY : '#0f172a', lineHeight: 1 }}>
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
        </div>

        <div className="span-6">
          <SectionHeader title="Resultados Recientes" action="Ver todos" onAction={() => router.push('/fixture')} />
          {lastDate && (
            <div style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginBottom: 8 }}>
              Última fecha jugada · {formatDate(lastDate)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lastDateMatches.map((m) => (
              <MatchCard key={m.id} m={m} colors={colors} />
            ))}
            {lastDateMatches.length === 0 && (
              <p className="card" style={{ padding: 24, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                Aún no hay resultados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
