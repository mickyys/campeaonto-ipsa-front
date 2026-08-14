'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBracket, useTeams, EMPTY_COPAS, formatDate } from '@/lib/hooks'
import { api } from '@/lib/api'
import type { Bracket, BracketCopaId, BracketMatch, CopaBrackets } from '@/lib/types'
import { AdminButton, ErrorNote, SuccessNote, Field, inputStyle } from './ui'

const ROUND_LABELS = ['Cuartos de Final', 'Semifinales', 'Final']

const COPAS: { id: BracketCopaId; label: string; color: string }[] = [
  { id: 'oro', label: 'Copa de Oro', color: '#d97706' },
  { id: 'plata', label: 'Copa de Plata', color: '#64748b' },
  { id: 'bronce', label: 'Copa de Bronce', color: '#b45309' },
]

const emptyBm = (): BracketMatch => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `b${Date.now()}`,
  home: null,
  away: null,
  status: 'upcoming',
})

export default function BracketTab() {
  const qc = useQueryClient()
  const { data: copas = EMPTY_COPAS, refetch } = useBracket()
  const { data: teams = [] } = useTeams()
  const [draft, setDraft] = useState<CopaBrackets | null>(null)
  const [active, setActive] = useState<BracketCopaId>('oro')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: (c: CopaBrackets) => api<CopaBrackets>('/api/admin/bracket', { method: 'PUT', body: JSON.stringify({ copas: c }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bracket'] }),
  })

  const teamNames = teams.map((t) => t.name)
  const editing = draft ?? copas
  const current: Bracket = editing[active] ?? []

  const begin = () => {
    setDraft(JSON.parse(JSON.stringify(copas)))
    setError(null)
    setOk(null)
  }

  const mutateRound = (fn: (rounds: Bracket) => Bracket) => {
    setDraft((d) => {
      const base = d ?? copas
      return { ...base, [active]: fn(base[active] ?? []) }
    })
  }

  const updateMatch = (ri: number, mi: number, patch: Partial<BracketMatch>) => {
    mutateRound((rounds) => {
      const next = rounds.map((r, i) => {
        if (i !== ri) return r
        return {
          ...r,
          matches: r.matches.map((m, j) => {
            if (j !== mi) return m
            const updated = { ...m, ...patch }
            if (updated.status === 'completed' && updated.homeScore != null && updated.awayScore != null) {
              updated.winner =
                updated.homeScore > updated.awayScore
                  ? (updated.home ?? undefined)
                  : updated.awayScore > updated.homeScore
                    ? (updated.away ?? undefined)
                    : undefined
            }
            return updated
          }),
        }
      })

      const completed = next[ri]?.matches?.[mi]
      if (completed?.winner && ri + 1 < next.length) {
        const targetMi = Math.floor(mi / 2)
        const slot = mi % 2 === 0 ? 'home' : 'away'
        const targetRound = next[ri + 1]
        if (targetRound?.matches?.[targetMi]) {
          next[ri + 1] = {
            ...targetRound,
            matches: targetRound.matches.map((m, j) =>
              j === targetMi ? { ...m, [slot]: completed.winner } : m,
            ),
          }
        }
      }

      return next
    })
  }

  const updateRoundName = (ri: number, name: string) => {
    mutateRound((rounds) => rounds.map((r, i) => (i === ri ? { ...r, name } : r)))
  }

  const addMatch = (ri: number) => {
    mutateRound((rounds) =>
      rounds.map((r, i) => (i === ri ? { ...r, matches: [...r.matches, emptyBm()] } : r)),
    )
  }

  const removeMatch = (ri: number, mi: number) => {
    mutateRound((rounds) =>
      rounds.map((r, i) =>
        i === ri ? { ...r, matches: r.matches.filter((_, j) => j !== mi) } : r,
      ),
    )
  }

  const addRound = () => {
    mutateRound((rounds) => [...rounds, { name: '', matches: [emptyBm()] }])
  }

  const removeRound = (ri: number) => {
    mutateRound((rounds) => rounds.filter((_, i) => i !== ri))
  }

  const submit = async () => {
    if (!draft) return
    setError(null)
    setOk(null)
    try {
      await save.mutateAsync(draft)
      setOk('Bracket guardado')
      setDraft(null)
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Las 3 copas se guardan completas en un solo paso.
        </div>
        {!draft ? (
          <AdminButton onClick={begin}>Editar bracket</AdminButton>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton onClick={addRound} tone="ghost">
              + Ronda
            </AdminButton>
            <AdminButton onClick={submit} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar cambios'}
            </AdminButton>
            <AdminButton tone="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </AdminButton>
          </div>
        )}
      </div>

      {error && <ErrorNote msg={error} />}
      {ok && <SuccessNote msg={ok} />}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COPAS.map((c) => {
          const configured = (editing[c.id] ?? []).some((r) => r.matches.some((m) => m.home || m.away))
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1.5px solid',
                borderColor: active === c.id ? c.color : '#e2e8f0',
                background: active === c.id ? c.color : '#fff',
                color: active === c.id ? '#fff' : '#334155',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: "'Barlow Condensed',sans-serif",
                letterSpacing: '.03em',
                textTransform: 'uppercase',
              }}
            >
              {c.label}
              {configured ? ' ✓' : ''}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {current.map((round, ri) => (
          <div key={ri} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {draft ? (
                  <input
                    style={{ ...inputStyle, width: 200, fontWeight: 700 }}
                    placeholder="Nombre de la ronda, ej: 4 de final"
                    value={round.name ?? ''}
                    onChange={(e) => updateRoundName(ri, e.target.value)}
                  />
                ) : (
                  <h4 style={{ margin: 0, fontSize: 14, color: '#0f172a' }}>
                    {round.name || ROUND_LABELS[ri] || `Ronda ${ri + 1}`}
                  </h4>
                )}
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>({round.matches.length})</span>
              </div>
              {draft && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <AdminButton small tone="ghost" onClick={() => addMatch(ri)}>
                    + Partido
                  </AdminButton>
                  <AdminButton small tone="danger" onClick={() => removeRound(ri)}>
                    Quitar ronda
                  </AdminButton>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {round.matches.map((m, mi) => {
                const done = m.status === 'completed'
                const scheduled = !!(m.date && m.time)
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      border: draft ? '1px dashed #e2e8f0' : 'none',
                      borderRadius: 8,
                      padding: draft ? '10px 12px' : 0,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ width: 180 }}>
                        <Field label="Local">
                          <select
                            style={inputStyle}
                            value={m.home ?? ''}
                            disabled={!draft}
                            onChange={(e) => updateMatch(ri, mi, { home: e.target.value || null })}
                          >
                            <option value="">TBD</option>
                            {teamNames.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <div style={{ width: 80 }}>
                        <Field label="Marcador">
                          <input
                            style={inputStyle}
                            type="number"
                            min={0}
                            disabled={!draft}
                            value={m.homeScore ?? ''}
                            onChange={(e) => updateMatch(ri, mi, { homeScore: Number(e.target.value) })}
                          />
                        </Field>
                      </div>
                      <div style={{ width: 80 }}>
                        <Field label="Marcador">
                          <input
                            style={inputStyle}
                            type="number"
                            min={0}
                            disabled={!draft}
                            value={m.awayScore ?? ''}
                            onChange={(e) => updateMatch(ri, mi, { awayScore: Number(e.target.value) })}
                          />
                        </Field>
                      </div>
                      <div style={{ width: 180 }}>
                        <Field label="Visita">
                          <select
                            style={inputStyle}
                            value={m.away ?? ''}
                            disabled={!draft}
                            onChange={(e) => updateMatch(ri, mi, { away: e.target.value || null })}
                          >
                            <option value="">TBD</option>
                            {teamNames.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12.5, color: '#334155' }}>
                          <input
                            type="checkbox"
                            checked={done}
                            disabled={!draft}
                            onChange={(e) =>
                              updateMatch(ri, mi, {
                                status: e.target.checked ? 'completed' : 'upcoming',
                                ...(e.target.checked ? { homeScore: m.homeScore ?? 0, awayScore: m.awayScore ?? 0 } : {}),
                              })
                            }
                          />
                          Terminado
                        </label>
                        {m.winner && <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700 }}>→ {m.winner}</span>}
                        {draft && (
                          <AdminButton small tone="danger" onClick={() => removeMatch(ri, mi)}>
                            ×
                          </AdminButton>
                        )}
                      </div>
                    </div>

                    {draft ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ width: 150 }}>
                          <Field label="Fecha">
                            <input
                              style={inputStyle}
                              type="date"
                              value={m.date ?? ''}
                              onChange={(e) => updateMatch(ri, mi, { date: e.target.value || undefined })}
                            />
                          </Field>
                        </div>
                        <div style={{ width: 100 }}>
                          <Field label="Hora">
                            <input
                              style={inputStyle}
                              type="time"
                              value={m.time ?? ''}
                              onChange={(e) => updateMatch(ri, mi, { time: e.target.value || undefined })}
                            />
                          </Field>
                        </div>
                        <div style={{ width: 90 }}>
                          <Field label="Cancha">
                            <input
                              style={inputStyle}
                              value={m.cancha ?? '1'}
                              onChange={(e) => updateMatch(ri, mi, { cancha: e.target.value || undefined })}
                            />
                          </Field>
                        </div>
                        <div style={{ width: 180 }}>
                          <Field label="Turno">
                            <select
                              style={inputStyle}
                              value={m.referee ?? ''}
                              onChange={(e) => updateMatch(ri, mi, { referee: e.target.value || undefined })}
                            >
                              <option value="">—</option>
                              {teamNames.map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    ) : scheduled ? (
                      <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, paddingBottom: 2 }}>
                        {formatDate(m.date)} · {m.time}
                        {m.cancha ? ` · Cancha ${m.cancha}` : ''}
                        {m.referee ? ` · Turno: ${m.referee}` : ''}
                      </div>
                    ) : null}
                  </div>
                )
              })}
              {round.matches.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Ronda vacía.</p>}
            </div>
          </div>
        ))}
        {current.length === 0 && (
          <p className="card" style={{ padding: 24, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
            Sin rondas en esta copa. Haz clic en “Editar bracket” y agrega una.
          </p>
        )}
      </div>
    </div>
  )
}
