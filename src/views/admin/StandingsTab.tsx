'use client'

import { useGroups, useStandings, pts, gd } from '@/lib/hooks'
import { LoadingState, ErrorState } from '@/components/ui'
import { NAVY } from './ui'

export default function StandingsTab() {
  const { data: groups = [], isPending, error, refetch } = useGroups()
  const standingsQ = useStandings()

  if (isPending || standingsQ.isPending) return <LoadingState />
  if (error || standingsQ.error) return <ErrorState message="No se pudieron cargar las posiciones." onRetry={() => { refetch(); standingsQ.refetch() }} />

  const standings = standingsQ.data ?? {}

  return (
    <div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
        Las posiciones se calculan automáticamente desde los partidos terminados (PTS → dif. de goles → goles a favor). Esta
        pestaña es de solo lectura.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groups.map((g) => {
          const rows = [...(standings[g.label] ?? [])].sort((a, b) => pts(b) - pts(a) || gd(b) - gd(a) || b.gf - a.gf)
          return (
            <div key={g.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 13, color: NAVY }}>
                Grupo {g.label}
              </div>
              <div style={{ overflowX: 'auto' }}>
              <table className="standings-table" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>POS</th>
                    <th style={{ minWidth: 150 }}>EQUIPO</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>PE</th>
                    <th>PP</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th style={{ color: NAVY }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s, i) => (
                    <tr key={s.team} className={i < 2 ? 'top' : ''}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: i < 2 ? 700 : 500 }}>{s.team}</td>
                      <td>{s.pj}</td>
                      <td>{s.g}</td>
                      <td>{s.e}</td>
                      <td>{s.p}</td>
                      <td>{s.gf}</td>
                      <td>{s.gc}</td>
                      <td style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16 }}>{pts(s)}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 18, textAlign: 'center', color: '#94a3b8' }}>
                        Sin partidos jugados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
