'use client'

import { useState } from 'react'
import { useGroups, useTeams } from '@/lib/hooks'
import type { Group } from '@/lib/types'
import { useSave, useDelete } from './crud'
import { AdminButton, ErrorNote, Field, Modal, SuccessNote, inputStyle } from './ui'

const emptyGroup = (): Group => ({ id: '', label: '', teamIds: [] })

export default function GroupsTab() {
  const { data: groups = [], refetch } = useGroups()
  const { data: teams = [] } = useTeams()
  const save = useSave<Group>('/api/admin/groups', ['groups'])
  const del = useDelete('/api/admin/groups', ['groups'])
  const [editing, setEditing] = useState<Group | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const startNew = () => {
    setEditing(emptyGroup())
    setIsNew(true)
    setError(null)
    setOk(null)
  }
  const startEdit = (g: Group) => {
    setEditing({ ...g, teamIds: [...g.teamIds] })
    setIsNew(false)
    setError(null)
    setOk(null)
  }
  const cancel = () => {
    setEditing(null)
    setError(null)
    setOk(null)
  }

  const toggleTeam = (id: string) => {
    setEditing((e) => {
      if (!e) return e
      const has = e.teamIds.includes(id)
      return { ...e, teamIds: has ? e.teamIds.filter((t) => t !== id) : [...e.teamIds, id] }
    })
  }

  const submit = async () => {
    if (!editing) return
    setError(null)
    setOk(null)
    if (!editing.label.trim()) return setError('El nombre del grupo es obligatorio')
    if (isNew && !editing.id.trim()) return setError('El id del grupo es obligatorio')
    try {
      await save.mutateAsync(editing)
      setOk(isNew ? 'Grupo creado' : 'Grupo actualizado')
      setEditing(null)
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    }
  }

  const handleDelete = async (g: Group) => {
    if (!confirm(`¿Eliminar el grupo "${g.label}"?`)) return
    setError(null)
    setOk(null)
    try {
      await del.mutateAsync(g.id)
      setOk('Grupo eliminado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{groups.length} grupos</div>
        <AdminButton onClick={startNew}>+ Nuevo grupo</AdminButton>
      </div>

      {error && <ErrorNote msg={error} />}
      {ok && <SuccessNote msg={ok} />}

      <Modal open={!!editing} title={editing ? (isNew ? 'Nuevo grupo' : `Editar: Grupo ${editing.label}`) : ''} onClose={cancel}>
        {editing && (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12, marginBottom: 14 }}>
            <Field label="ID">
              <input
                style={inputStyle}
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => setEditing((s) => (s ? { ...s, id: e.target.value.trim() } : s))}
                placeholder="ej: gA"
              />
            </Field>
            <Field label="Nombre (ej: A)">
              <input
                style={inputStyle}
                value={editing.label}
                maxLength={5}
                onChange={(e) => setEditing((s) => (s ? { ...s, label: e.target.value.toUpperCase() } : s))}
                placeholder="A"
              />
            </Field>
          </div>

          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
            Equipos ({editing.teamIds.length})
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 8, marginBottom: 16 }}>
            {teams.map((t) => {
              const checked = editing.teamIds.includes(t.id)
              return (
                <label
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    border: '1.5px solid',
                    borderColor: checked ? '#1e3a8a' : '#e2e8f0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: checked ? '#eff6ff' : '#fff',
                    transition: 'all .12s',
                  }}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleTeam(t.id)} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{t.name}</span>
                </label>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <AdminButton onClick={submit} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar'}
            </AdminButton>
            <AdminButton tone="ghost" onClick={cancel}>
              Cancelar
            </AdminButton>
          </div>
          </>
        )}
      </Modal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map((g) => (
          <div key={g.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                background: NAVY,
                color: '#fff',
                borderRadius: 6,
                padding: '4px 10px',
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {g.label}
            </span>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
                {g.teamIds.length > 0
                  ? g.teamIds
                      .map((id) => teams.find((t) => t.id === id)?.name ?? id)
                      .join(' · ')
                  : 'Sin equipos'}
              </div>
            </div>
            <AdminButton small tone="ghost" onClick={() => startEdit(g)}>
              Editar
            </AdminButton>
            <AdminButton small tone="danger" onClick={() => handleDelete(g)}>
              Eliminar
            </AdminButton>
          </div>
        ))}
        {groups.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay grupos.</p>}
      </div>
    </div>
  )
}

const NAVY = '#1e3a8a'
