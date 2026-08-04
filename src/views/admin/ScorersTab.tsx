'use client'

import { useState } from 'react'
import { useScorers, useTeams } from '@/lib/hooks'
import type { Scorer } from '@/lib/types'
import { useSave, useDelete } from './crud'
import { AdminButton, ErrorNote, Field, SuccessNote, inputStyle } from './ui'

const emptyScorer = (): Scorer => ({
  id: '',
  name: '',
  team: '',
  goals: 0,
})

export default function ScorersTab() {
  const { data: scorers = [], refetch } = useScorers()
  const { data: teams = [] } = useTeams()
  const save = useSave<Scorer>('/api/admin/scorers', ['scorers'])
  const del = useDelete('/api/admin/scorers', ['scorers'])
  const [editing, setEditing] = useState<Scorer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const teamNames = teams.map((t) => t.name)

  const startNew = () => {
    setEditing(emptyScorer())
    setIsNew(true)
    setError(null)
    setOk(null)
  }
  const startEdit = (s: Scorer) => {
    setEditing({ ...s })
    setIsNew(false)
    setError(null)
    setOk(null)
  }
  const cancel = () => {
    setEditing(null)
    setError(null)
    setOk(null)
  }

  const set = (patch: Partial<Scorer>) => setEditing((e) => (e ? { ...e, ...patch } : e))

  const submit = async () => {
    if (!editing) return
    setError(null)
    setOk(null)
    if (!editing.name.trim()) return setError('El nombre del jugador es obligatorio')
    if (!editing.team) return setError('Selecciona el equipo')
    if (isNew && !editing.id.trim()) return setError('El id es obligatorio')
    try {
      await save.mutateAsync(editing)
      setOk(isNew ? 'Goleador creado' : 'Goleador actualizado')
      setEditing(null)
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    }
  }

  const handleDelete = async (s: Scorer) => {
    if (!confirm(`¿Eliminar a ${s.name}?`)) return
    setError(null)
    setOk(null)
    try {
      await del.mutateAsync(s.id)
      setOk('Goleador eliminado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{scorers.length} goleadores</div>
        <AdminButton onClick={startNew}>+ Nuevo goleador</AdminButton>
      </div>

      {error && <ErrorNote msg={error} />}
      {ok && <SuccessNote msg={ok} />}

      {editing && (
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#0f172a' }}>
            {isNew ? 'Nuevo goleador' : `Editar: ${editing.name}`}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 12 }}>
            <Field label="ID">
              <input
                style={inputStyle}
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => set({ id: e.target.value.trim() })}
                placeholder="ej: s7"
              />
            </Field>
            <Field label="Nombre">
              <input style={inputStyle} value={editing.name} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Equipo">
              <select style={inputStyle} value={editing.team} onChange={(e) => set({ team: e.target.value })}>
                <option value="">—</option>
                {teamNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Goles">
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={editing.goals}
                onChange={(e) => set({ goals: Number(e.target.value) })}
              />
            </Field>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scorers.map((s, i) => (
          <div key={s.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: i === 0 ? '#d97706' : i < 3 ? '#dbeafe' : '#f1f5f9',
                color: i === 0 ? '#fff' : i < 3 ? '#1e3a8a' : '#94a3b8',
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
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{s.name}</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{s.team}</div>
            </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', lineHeight: 1 }}>
                  {s.goals}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>goles</div>
              </div>
            <AdminButton small tone="ghost" onClick={() => startEdit(s)}>
              Editar
            </AdminButton>
            <AdminButton small tone="danger" onClick={() => handleDelete(s)}>
              Eliminar
            </AdminButton>
          </div>
        ))}
        {scorers.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay goleadores.</p>}
      </div>
    </div>
  )
}
