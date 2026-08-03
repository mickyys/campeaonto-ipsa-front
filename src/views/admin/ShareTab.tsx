'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import html2canvas from 'html2canvas'
import { useMatches, useSettings, useTeams } from '@/lib/hooks'
import type { Match, Team } from '@/lib/types'
import { AdminButton, Field, inputStyle } from './ui'

const MATCH_DURATION = 50

const addMins = (time: string, mins: number) => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const fmtDateShort = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const date = new Date(Date.UTC(y, m - 1, d))
  return `${names[date.getUTCDay()]} ${d} de ${months[m - 1]}`.toUpperCase()
}

const BG = '#0d1c38'
const BG2 = '#0b1830'
const DIVIDER = 'rgba(255,255,255,0.07)'
const GOLD = '#f5c842'
const MUTED = '#7a9abf'

function FixtureCard({
  matches,
  date,
  teams,
  orgName,
  contactEmail,
  feedRef,
}: {
  matches: Match[]
  date: string
  teams: Team[]
  orgName: string
  contactEmail: string
  feedRef: React.RefObject<HTMLDivElement | null>
}) {
  const colorMap = new Map<string, string>()
  for (const t of teams) colorMap.set(t.name, t.color)
  const getColor = (name: string) => colorMap.get(name) ?? MUTED

  return (
    <div
      ref={feedRef}
      style={{
        width: 360,
        background: BG,
        fontFamily: "'Barlow Condensed','Inter',sans-serif",
        overflow: 'hidden',
        borderRadius: 16,
      }}
    >
      <div
        style={{
          padding: '22px 24px 16px',
          background: `linear-gradient(180deg, #0f2454 0%, ${BG} 100%)`,
          textAlign: 'center',
          borderBottom: `1px solid ${DIVIDER}`,
        }}
      >
        <Image
          src="/ipsa-logo.png"
          alt="IPSA"
          width={64}
          height={64}
          unoptimized
          style={{ objectFit: 'contain', marginBottom: 10, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.4))' }}
        />
        <div style={{ fontWeight: 800, fontSize: 28, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: 0.95 }}>
          CAMPEONATO DE
          <br />
          APODERADOS
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: GOLD, letterSpacing: '.1em', marginTop: 6 }}>IPSA 2025</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: `1px solid ${DIVIDER}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14 }}>📅</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: GOLD, letterSpacing: '.06em' }}>{fmtDateShort(date)}</span>
      </div>

      <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>⚽</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '.09em', textTransform: 'uppercase' }}>
          Programación oficial de partidos
        </span>
      </div>

      <div>
        {matches.map((m, i) => {
          const endTime = addMins(m.time, MATCH_DURATION)
          const hc = getColor(m.homeTeam)
          const ac = getColor(m.awayTeam)
          const hw = m.status === 'completed' && (m.homeScore ?? 0) > (m.awayScore ?? 0)
          const aw = m.status === 'completed' && (m.awayScore ?? 0) > (m.homeScore ?? 0)
          return (
            <div
              key={m.id}
              style={{ borderBottom: `1px solid ${DIVIDER}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.025)' }}
            >
              <div style={{ display: 'flex', alignItems: 'stretch', padding: 0 }}>
                <div
                  style={{
                    width: 68,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 0',
                    borderRight: `1px solid ${DIVIDER}`,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>{m.time}</span>
                  <span style={{ fontSize: 10, color: MUTED, margin: '2px 0 1px' }}>–</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '.02em' }}>{endTime}</span>
                </div>

                <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: hc, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: hw ? '#fff' : 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.01em', lineHeight: 1 }}>
                      {m.homeTeam}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ac, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: aw ? '#fff' : 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.01em', lineHeight: 1 }}>
                      {m.awayTeam}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: 66,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    borderLeft: `1px solid ${DIVIDER}`,
                    gap: 4,
                  }}
                >
                  {m.status === 'completed' ? (
                    <>
                      <span style={{ fontSize: 20, fontWeight: 800, color: GOLD, lineHeight: 1, letterSpacing: '.02em' }}>
                        {m.homeScore}–{m.awayScore}
                      </span>
                      <span style={{ fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '.05em' }}>FINAL</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>
                        Cancha
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{m.cancha}</span>
                      <span style={{ fontSize: 9, color: MUTED, fontWeight: 600, letterSpacing: '.04em' }}>G{m.group}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '12px 20px', background: BG2, borderTop: `1px solid ${DIVIDER}`, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: '.05em' }}>{orgName}</div>
        <div style={{ fontSize: 10, color: 'rgba(122,154,191,.6)', marginTop: 2 }}>{contactEmail}</div>
      </div>
    </div>
  )
}

export default function ShareTab() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [selDate, setSelDate] = useState<string>('')
  const [genStatus, setGenStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const { data: matches = [] } = useMatches()
  const { data: teams = [] } = useTeams()
  const { data: settings } = useSettings()
  const orgName = settings?.orgName ?? 'CENTRO DE PADRES IPSA SAI'
  const contactEmail = settings?.contactEmail ?? 'centrodepadresipsasai@gmail.com'

  const dates = [...new Set(matches.map((m) => m.date))].sort()
  const effectiveDate = selDate || dates[0] || ''
  const dayMatches = effectiveDate
    ? matches.filter((m) => m.date === effectiveDate).sort((a, b) => a.time.localeCompare(b.time))
    : []

  const selectDate = (d: string) => {
    setSelDate(d)
    setGenStatus('idle')
    setImgUrl(null)
  }

  const generate = async () => {
    if (!cardRef.current) return
    setGenStatus('generating')
    setImgUrl(null)
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2.5, useCORS: true, logging: false, backgroundColor: '#0d1c38' })
      setImgUrl(canvas.toDataURL('image/png'))
      setGenStatus('done')
    } catch {
      setGenStatus('idle')
    }
  }

  const download = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = `fixture-ipsa-${effectiveDate}.png`
    a.click()
  }

  const shareWA = async () => {
    if (!imgUrl) return
    try {
      const blob = await (await fetch(imgUrl)).blob()
      const file = new File([blob], `fixture-ipsa-${effectiveDate}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Fixture IPSA SAI 2025', text: `Fixture ${fmtDateShort(effectiveDate)}` })
        return
      }
    } catch {
      // fallback
    }
    const txt =
      `⚽ *Campeonato Apoderados IPSA SAI 2025*\n📅 ${fmtDateShort(effectiveDate)}\n\n` +
      dayMatches
        .map((m) =>
          `🕐 ${m.time}–${addMins(m.time, MATCH_DURATION)} | *${m.homeTeam}* vs *${m.awayTeam}*` +
          (m.status === 'completed' ? ` — ${m.homeScore}–${m.awayScore}` : ` | Cancha ${m.cancha}`),
        )
        .join('\n') +
      `\n\n_Organiza: ${orgName}_`
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'clamp(240px,30%,320px) 1fr', gap: 28, alignItems: 'start' }}>
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Compartir Fixture por Fecha</h2>

        <Field label="Fecha">
          <select style={inputStyle} value={effectiveDate} onChange={(e) => selectDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {fmtDateShort(d)}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px', margin: '14px 0 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {dayMatches.length} partidos
          </div>
          {dayMatches.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sin partidos esta fecha.</p>
          ) : (
            dayMatches.map((m) => (
              <div key={m.id} style={{ fontSize: 12, color: '#475569', padding: '5px 0', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: '#94a3b8', width: 34, flexShrink: 0 }}>{m.time}</span>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: teams.find((t) => t.name === m.homeTeam)?.color ?? '#cbd5e1',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontWeight: 500 }}>
                  {m.homeTeam} vs {m.awayTeam}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <AdminButton onClick={generate} disabled={!dayMatches.length || genStatus === 'generating'}>
            {genStatus === 'generating' ? '⏳ Generando…' : '🎨 Generar imagen'}
          </AdminButton>
          {genStatus === 'done' && (
            <>
              <AdminButton tone="ghost" onClick={download}>
                ⬇ Descargar PNG
              </AdminButton>
              <button
                onClick={shareWA}
                style={{
                  padding: '10px 18px',
                  borderRadius: 9,
                  border: 'none',
                  background: '#25D366',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Compartir por WhatsApp
              </button>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                En móvil envía la imagen directo a WhatsApp. En escritorio descarga el PNG y compártelo manualmente.
              </p>
            </>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          {genStatus === 'done' ? 'Imagen generada' : 'Vista previa'}
        </div>
        {genStatus === 'done' && imgUrl ? (
          <Image src={imgUrl} alt="Fixture" width={400} height={640} unoptimized style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 14, display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }} />
        ) : (
          <FixtureCard matches={dayMatches} date={effectiveDate} teams={teams} orgName={orgName} contactEmail={contactEmail} feedRef={cardRef} />
        )}
        {genStatus === 'done' && (
          <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
            <FixtureCard matches={dayMatches} date={effectiveDate} teams={teams} orgName={orgName} contactEmail={contactEmail} feedRef={cardRef} />
          </div>
        )}
      </div>
    </div>
  )
}
