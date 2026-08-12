'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Team } from '@/lib/types'

// Save (POST when no id, PUT /:id when it has one) and invalidate the query.
export function useSave<T extends { id: string }>(basePath: string, queryKey: string[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entity, isNew }: { entity: T; isNew: boolean }) =>
      isNew
        ? api<T>(basePath, { method: 'POST', body: JSON.stringify(entity) })
        : api<T>(`${basePath}/${encodeURIComponent(entity.id)}`, {
            method: 'PUT',
            body: JSON.stringify(entity),
          }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useDelete(basePath: string, queryKey: string[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<{ ok: boolean }>(`${basePath}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

// Retira/reactiva un equipo (POST /:id/retire | /:id/reactivate) e invalida
// las queries afectadas: equipos, partidos, libres, posiciones y goleadores.
export function useToggleActive(basePath: string, queryKeys: string[][]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<Team>(`${basePath}/${encodeURIComponent(id)}/${active ? 'reactivate' : 'retire'}`, {
        method: 'POST',
      }),
    onSuccess: () => {
      for (const k of queryKeys) qc.invalidateQueries({ queryKey: k })
    },
  })
}
