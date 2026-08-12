'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { useTeams } from '@/lib/hooks'
import type { Player, Team } from '@/lib/types'
import { useSave, useDelete, useToggleActive } from './crud'
import { AdminButton, ErrorNote, Field, Modal, SuccessNote, inputStyle, NAVY, generateId } from './ui'

const GUARDIAN_TYPES = ['Padre', 'Padrastro', 'Otro']

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const emptyPlayer = (): Player => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `p${Date.now()}`,
  num: 1,
  name: '',
  guardianType: 'Padre',
  studentName: '',
})

const emptyTeam = (): Team => ({ id: generateId('tm'), name: '', color: NAVY, players: [] })

export default function TeamsTab() {
  const { data: teams = [], refetch } = useTeams()
  const save = useSave<Team>('/api/admin/teams', ['teams'])
  const del = useDelete('/api/admin/teams', ['teams'])
  const toggleActive = useToggleActive('/api/admin/teams', [
    ['teams'],
    ['matches'],
    ['free-teams'],
    ['standings'],
    ['standings-general'],
    ['scorers'],
  ])
  const [editing, setEditing] = useState<Team | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const startNew = () => {
    setEditing(emptyTeam())
    setIsNew(true)
    setError(null)
    setOk(null)
  }
  const startEdit = (t: Team) => {
    setEditing(JSON.parse(JSON.stringify(t)))
    setIsNew(false)
    setError(null)
    setOk(null)
  }
  const cancel = () => {
    setEditing(null)
    setError(null)
    setOk(null)
  }

  const update = (patch: Partial<Team>) => {
    setEditing((e) => (e ? { ...e, ...patch } : e))
  }

  const updatePlayer = (idx: number, patch: Partial<Player>) => {
    setEditing((e) => {
      if (!e) return e
      const players = e.players.map((p, i) => (i === idx ? { ...p, ...patch } : p))
      return { ...e, players }
    })
  }

  const addPlayer = () => {
    setEditing((e) => (e ? { ...e, players: [...e.players, emptyPlayer()] } : e))
  }

  const removePlayer = (idx: number) => {
    setEditing((e) => (e ? { ...e, players: e.players.filter((_, i) => i !== idx) } : e))
  }

  const handleImport = async (file: File) => {
    if (!editing || isNew) return
    setError(null)
    setOk(null)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      if (!ws) return setError('El archivo no contiene hojas de datos')
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      if (rows.length === 0) return setError('El archivo no tiene filas de datos')
      const headers = Object.keys(rows[0])
      const find = (...names: string[]) =>
        headers.find((h) => names.map(norm).includes(norm(h)))
      const colNum = find('n°', 'nro', 'numero', 'n', '#')
      const colName = find('nombre', 'jugador')
      const colApod = find('apoderado')
      const colAlumno = find('alumno', 'estudiante')
      if (!colName) return setError('No se encontró la columna "Nombre"')
      const additions: Player[] = rows
        .filter((r) => String(r[colName]).trim())
        .map((r) => ({
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `p${Date.now()}-${Math.random()}`,
          num: colNum ? Number(r[colNum]) || 0 : 0,
          name: String(r[colName]).trim(),
          guardianType: colApod ? String(r[colApod]).trim() : '',
          studentName: colAlumno ? String(r[colAlumno]).trim() : '',
        }))
      setEditing((e) => {
        if (!e) return e
        const players = [...e.players]
        for (const a of additions) {
          const idx = players.findIndex((p) => p.num === a.num)
          if (idx >= 0) players[idx] = { ...players[idx], ...a, id: players[idx].id }
          else players.push(a)
        }
        return { ...e, players }
      })
      setOk(`${additions.length} jugadores importados desde Excel`)
    } catch {
      setError('No se pudo leer el archivo. Usa .xlsx, .xls o .csv')
    }
  }

  const submit = async () => {
    if (!editing) return
    setError(null)
    setOk(null)
    if (!editing.name.trim()) return setError('El nombre del equipo es obligatorio')
    const invalid = editing.players.find((p) => !p.name.trim() || !p.num)
    if (invalid) return setError('Cada jugador debe tener nombre y número')
    try {
      await save.mutateAsync({ entity: editing, isNew })
      setOk(isNew ? 'Equipo creado' : 'Equipo actualizado')
      setEditing(null)
      refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    }
  }

  const handleDelete = async (t: Team) => {
    if (!confirm(`¿Eliminar el equipo "${t.name}"?`)) return
    setError(null)
    setOk(null)
    try {
      await del.mutateAsync(t.id)
      setOk('Equipo eliminado')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  const handleToggleActive = async (t: Team) => {
    const retired = t.active === false
    if (!retired) {
      if (
        !confirm(
          `¿Retirar el equipo "${t.name}" del campeonato?\n\nSe cancelarán sus partidos pendientes. El equipo quedará al final de la tabla como "Retirado" y no clasificará a las copas.`,
        )
      )
        return
    } else {
      if (!confirm(`¿Reactivar el equipo "${t.name}"? Volverá a participar de las tablas.`)) return
    }
    setError(null)
    setOk(null)
    try {
      await toggleActive.mutateAsync({ id: t.id, active: !retired })
      setOk(retired ? 'Equipo reactivado' : 'Equipo retirado del campeonato')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el equipo')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{teams.length} equipos registrados</div>
        <AdminButton onClick={startNew}>+ Nuevo equipo</AdminButton>
      </div>

      {error && <ErrorNote msg={error} />}
      {ok && <SuccessNote msg={ok} />}

      <Modal open={!!editing} title={editing ? (isNew ? 'Nuevo equipo' : `Editar: ${editing.name}`) : ''} onClose={cancel} maxWidth={720}>
        {editing && (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
            <Field label="ID">
              <input
                style={{ ...inputStyle, background: '#f8fafc', color: '#64748b' }}
                value={editing.id}
                readOnly
              />
            </Field>
            <Field label="Nombre">
              <input style={inputStyle} value={editing.name} onChange={(e) => update({ name: e.target.value })} placeholder="ej: Kinder A" />
            </Field>
            <Field label="Color">
              <input
                style={{ ...inputStyle, padding: 4 }}
                type="color"
                value={editing.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Jugadores ({editing.players.length})</span>
            <AdminButton small tone="ghost" onClick={addPlayer}>
              + Agregar jugador
            </AdminButton>
          </div>

          {!isNew && (
            <div style={{ marginBottom: 12, padding: '10px 12px', border: '1px dashed #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Importar nómina (mergea con los jugadores existentes por N°)
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ fontSize: 12, maxWidth: 260 }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    handleImport(f)
                    e.target.value = ''
                  }
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editing.players.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 72px' }}>
                  <Field label="N°">
                    <input
                      style={inputStyle}
                      type="number"
                      min={0}
                      value={p.num}
                      onChange={(e) => updatePlayer(i, { num: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <div style={{ flex: '1 1 130px', minWidth: 100 }}>
                  <Field label="Nombre">
                    <input style={inputStyle} value={p.name} onChange={(e) => updatePlayer(i, { name: e.target.value })} />
                  </Field>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <Field label="Tipo de apoderado" hint="opcional">
                    <select
                      style={inputStyle}
                      value={p.guardianType ?? ''}
                      onChange={(e) => updatePlayer(i, { guardianType: e.target.value })}
                    >
                      <option value="">—</option>
                      {GUARDIAN_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div style={{ flex: '1 1 140px', minWidth: 100 }}>
                  <Field label="Nombre del alumno" hint="opcional">
                    <input
                      style={inputStyle}
                      value={p.studentName ?? ''}
                      onChange={(e) => updatePlayer(i, { studentName: e.target.value })}
                    />
                  </Field>
                </div>
                <button
                  onClick={() => removePlayer(i)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#dc2626',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '6px 4px',
                    marginBottom: 2,
                    flexShrink: 0,
                  }}
                  title="Quitar jugador"
                >
                  ×
                </button>
              </div>
            ))}
            {editing.players.length === 0 && (
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sin jugadores. Agrega al menos uno.</p>
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
          </>
        )}
      </Modal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {teams.map((t) => {
          const retired = t.active === false
          return (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: retired ? 0.72 : 1,
                background: retired ? '#f8fafc' : '#fff',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.name}
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
                      }}
                    >
                      Retirado
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{t.players.length} jugadores · id: {t.id}</div>
              </div>
              <AdminButton small tone="ghost" onClick={() => startEdit(t)}>
                Editar
              </AdminButton>
              <AdminButton small tone={retired ? 'primary' : 'warning'} onClick={() => handleToggleActive(t)}>
                {retired ? 'Reactivar' : 'Retirar'}
              </AdminButton>
              <AdminButton small tone="danger" onClick={() => handleDelete(t)}>
                Eliminar
              </AdminButton>
            </div>
          )
        })}
        {teams.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay equipos.</p>}
      </div>
    </div>
  )
}
