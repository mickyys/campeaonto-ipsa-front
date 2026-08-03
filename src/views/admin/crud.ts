'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Save (POST when no id, PUT /:id when it has one) and invalidate the query.
export function useSave<T extends { id?: string }>(basePath: string, queryKey: string[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: T) =>
      body.id
        ? api<T>(`${basePath}/${encodeURIComponent(body.id)}`, {
            method: 'PUT',
            body: JSON.stringify(body),
          })
        : api<T>(basePath, { method: 'POST', body: JSON.stringify(body) }),
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
