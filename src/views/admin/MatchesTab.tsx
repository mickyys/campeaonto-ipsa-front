'use client'

import { useState } from 'react'
import { useGroups, useMatches, useTeams } from '@/lib/hooks'
import type { Match } from '@/lib/types'
import { useSave, useDelete } from './crud'
import { AdminButton, ErrorNote, Field, SuccessNote, inputStyle } from './ui'

const emptyMatch = (): Match => ({
  id: '',
  homeTeam: '',
  awayTeam: '',
  date: '',
  time: '',
  group: '',
  cancha: '1',
  status: 'upcoming',
})

export default function MatchesTab() {
  const { data: matches = [], refetch } = useMatches()
  const { data: teams = [] } = useTeams()
  const { data: groups = [] } = useGroups()
  const save = useSave<Match>('/api/admin/matches', ['matches'])
  const del = useDelete('/api/admin/matches', ['matches'])
  const [editing, setEditing] = useState<Match | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const teamNames = teams.map((t) => t.name)
  const groupLabels = groups.map((g) => g.label)

  const startNew = () => {
    setEditing(emptyMatch())
    setIsNew(true)
    setError(null)
    setOk(null)
  }
  const startEdit = (m: Match) => {
    setEditing({ ...m })
    setIsNew(false)
    setError(null)
    setOk(null)
  }
  const cancel = () => {
    setEditing(null)
    setError(null)
    setOk(null)
  }

  const set = (patch: Partial<Match>) => setEditing((e) => (e ? { ...e, ...patch } : e))

  const submit = async () => {
    if (!editing) return
    setError(null)
    setOk(null)
    if (!editing.homeTeam || !editing.awayTeam) return setError('Selecciona ambos equipos')
    if (editing.homeTeam === editing.awayTeam) return setError('Los equipos deben ser distintos')
    if (!editing.date) return setError('La fecha es obligatoria')
    if (!editing.time) return setError('La hora es obligatoria')
    if (isNew && !editing.id.trim()) return setError('El id es obligatorio')
    if (editing.status === 'completed' && (editing.homeScore == null || editing.awayScore == null)) {
      return setError('Ingresa los marcadores para un partido terminado')
    }
    try {
      await save.mutateAsync(editing)
      setOk(isNew ? 'Partido creado' : 'Partido actualizado')
      setEditing(null)
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    }
  }

  const handleDelete = async (m: Match) => {
    if (!confirm(`¿Eliminar el partido ${m.homeTeam} vs ${m.awayTeam}?`)) return
    setError(null)
    setOk(null)
    try {
      await del.mutateAsync(m.id)
      setOk('Partido eliminado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{matches.length} partidos</div>
        <AdminButton onClick={startNew}>+ Nuevo partido</AdminButton>
      </div>

      {error && <ErrorNote msg={error} />}
      {ok && <SuccessNote msg={ok} />}

      {editing && (
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#0f172a' }}>
            {isNew ? 'Nuevo partido' : `Editar: ${editing.homeTeam} vs ${editing.awayTeam}`}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 12 }}>
            <Field label="ID">
              <input
                style={inputStyle}
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => set({ id: e.target.value.trim() })}
                placeholder="ej: m14"
              />
            </Field>
            <Field label="Fecha">
              <input style={inputStyle} type="date" value={editing.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
            <Field label="Hora">
              <input style={inputStyle} type="time" value={editing.time} onChange={(e) => set({ time: e.target.value })} />
            </Field>
            <Field label="Grupo">
              <select style={inputStyle} value={editing.group} onChange={(e) => set({ group: e.target.value })}>
                <option value="">—</option>
                {groupLabels.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cancha">
              <input style={inputStyle} value={editing.cancha} onChange={(e) => set({ cancha: e.target.value })} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 12, marginTop: 12 }}>
            <Field label="Local">
              <select style={inputStyle} value={editing.homeTeam} onChange={(e) => set({ homeTeam: e.target.value })}>
                <option value="">—</option>
                {teamNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Visita">
              <select style={inputStyle} value={editing.awayTeam} onChange={(e) => set({ awayTeam: e.target.value })}>
                <option value="">—</option>
                {teamNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turno">
              <select style={inputStyle} value={editing.referee ?? ''} onChange={(e) => set({ referee: e.target.value || undefined })}>
                <option value="">—</option>
                {teamNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingBottom: 8 }}>
              <input
                type="checkbox"
                checked={editing.status === 'completed'}
                onChange={(e) =>
                  set({
                    status: e.target.checked ? 'completed' : 'upcoming',
                    ...(e.target.checked ? { homeScore: editing.homeScore ?? 0, awayScore: editing.awayScore ?? 0 } : {}),
                  })
                }
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Partido terminado</span>
            </label>
            {editing.status === 'completed' && (
              <>
                <div style={{ width: 100 }}>
                  <Field label="Local">
                    <input
                      style={inputStyle}
                      type="number"
                      min={0}
                      value={editing.homeScore ?? 0}
                      onChange={(e) => set({ homeScore: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <div style={{ width: 100 }}>
                  <Field label="Visita">
                    <input
                      style={inputStyle}
                      type="number"
                      min={0}
                      value={editing.awayScore ?? 0}
                      onChange={(e) => set({ awayScore: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <AdminButton onClick={submit} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar'}
            </AdminButton>
            <AdminButton tone="ghost" onClick={cancel}>
              Cancelar
            </AdminButton>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.entries(
          matches.reduce<Record<string, Match[]>>((acc, m) => {
            ;(acc[m.date] ??= []).push(m)
            return acc
          }, {}),
        )
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, dayMatches]) => (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#1e3a8a',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  padding: '6px 2px',
                  borderBottom: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                📅 {date}
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>({dayMatches.length})</span>
              </div>
              {dayMatches
                .slice()
                .sort((a, b) => b.time.localeCompare(a.time))
                .map((m) => {
                  const done = m.status === 'completed'
                  return (
                    <div key={m.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 86, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{m.time}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          Cancha {m.cancha}
                          {m.referee ? ` · Turno: ${m.referee}` : ''}
                        </div>
                      </div>
                      <span
                        style={{
                          background: '#eef2ff',
                          color: '#1e3a8a',
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {m.group}
                      </span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {m.homeTeam}
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>vs</span>
                        {m.awayTeam}
                        {done && (
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginLeft: 6 }}>
                            {m.homeScore}–{m.awayScore}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          borderRadius: 4,
                          padding: '2px 7px',
                          background: done ? '#dcfce7' : '#f1f5f9',
                          color: done ? '#16a34a' : '#94a3b8',
                        }}
                      >
                        {done ? 'Terminado' : 'Próximo'}
                      </span>
                      <AdminButton small tone="ghost" onClick={() => startEdit(m)}>
                        Editar
                      </AdminButton>
                      <AdminButton small tone="danger" onClick={() => handleDelete(m)}>
                        Eliminar
                      </AdminButton>
                    </div>
                  )
                })}
            </div>
          ))}
        {matches.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay partidos.</p>}
      </div>
    </div>
  )
}
