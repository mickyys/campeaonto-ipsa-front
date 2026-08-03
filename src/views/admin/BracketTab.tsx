'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBracket, useTeams } from '@/lib/hooks'
import { api } from '@/lib/api'
import type { Bracket, BracketMatch } from '@/lib/types'
import { AdminButton, ErrorNote, SuccessNote, Field, inputStyle } from './ui'

const ROUND_LABELS = ['Cuartos de Final', 'Semifinales', 'Final']

const emptyBm = (): BracketMatch => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `b${Date.now()}`,
  home: null,
  away: null,
  status: 'upcoming',
})

export default function BracketTab() {
  const qc = useQueryClient()
  const { data: bracket = [], refetch } = useBracket()
  const { data: teams = [] } = useTeams()
  const [draft, setDraft] = useState<Bracket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: (rounds: Bracket) => api<Bracket>('/api/admin/bracket', { method: 'PUT', body: JSON.stringify({ rounds }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bracket'] }),
  })

  const teamNames = teams.map((t) => t.name)
  const editing = draft ?? bracket

  const begin = () => {
    setDraft(JSON.parse(JSON.stringify(bracket)))
    setError(null)
    setOk(null)
  }

  const updateMatch = (ri: number, mi: number, patch: Partial<BracketMatch>) => {
    setDraft((d) => {
      const base = d ?? bracket
      return base.map((r, i) => {
        if (i !== ri) return r
        const matches = r.map((m, j) => {
          if (j !== mi) return m
          const next = { ...m, ...patch }
          if (next.status === 'completed' && next.homeScore != null && next.awayScore != null) {
            next.winner =
              next.homeScore > next.awayScore
                ? (next.home ?? undefined)
                : next.awayScore > next.homeScore
                  ? (next.away ?? undefined)
                  : undefined
          }
          return next
        })
        return matches
      })
    })
  }

  const addMatch = (ri: number) => {
    setDraft((d) => {
      const base = d ?? bracket
      return base.map((r, i) => (i === ri ? [...r, emptyBm()] : r))
    })
  }

  const removeMatch = (ri: number, mi: number) => {
    setDraft((d) => {
      const base = d ?? bracket
      return base.map((r, i) => (i === ri ? r.filter((_, j) => j !== mi) : r))
    })
  }

  const addRound = () => {
    setDraft((d) => [...(d ?? bracket), [emptyBm()]])
  }

  const removeRound = (ri: number) => {
    setDraft((d) => (d ?? bracket).filter((_, i) => i !== ri))
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
        <div style={{ fontSize: 12, color: '#64748b' }}>El bracket se guarda completo en un solo paso.</div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {editing.map((round, ri) => (
          <div key={ri} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: '#0f172a' }}>
                {ROUND_LABELS[ri] ?? `Ronda ${ri + 1}`}{' '}
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>({round.length})</span>
              </h4>
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
              {round.map((m, mi) => {
                const done = m.status === 'completed'
                return (
                  <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
                )
              })}
              {round.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Ronda vacía.</p>}
            </div>
          </div>
        ))}
        {editing.length === 0 && (
          <p className="card" style={{ padding: 24, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
            Sin rondas. Haz clic en “Editar bracket” y agrega una.
          </p>
        )}
      </div>
    </div>
  )
}
