'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import type {
  CopaBrackets,
  FreeTeams,
  Group,
  Match,
  PublicUser,
  Scorer,
  Settings,
  Standing,
  Standings,
  Team,
} from './types'

const STALE = 30_000

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => api<Team[]>('/api/teams'),
    staleTime: STALE,
  })
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api<Group[]>('/api/groups'),
    staleTime: STALE,
  })
}

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => api<Match[]>('/api/matches'),
    staleTime: STALE,
  })
}

export function useFreeTeams() {
  return useQuery({
    queryKey: ['free-teams'],
    queryFn: () => api<FreeTeams[]>('/api/free-teams'),
    staleTime: STALE,
  })
}

export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: () => api<Standings>('/api/standings'),
    staleTime: STALE,
  })
}

export function useScorers() {
  return useQuery({
    queryKey: ['scorers'],
    queryFn: () => api<Scorer[]>('/api/scorers'),
    staleTime: STALE,
  })
}

export function useBracket() {
  return useQuery({
    queryKey: ['bracket'],
    queryFn: () => api<CopaBrackets>('/api/bracket'),
    staleTime: STALE,
  })
}

export const EMPTY_COPAS: CopaBrackets = { oro: [], plata: [], bronce: [] }

export function hasBracketConfigured(copas?: CopaBrackets | null): boolean {
  if (!copas) return false
  return Object.values(copas).some((bracket) =>
    bracket.some((round) => round.matches.some((m) => m.home || m.away)),
  )
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api<Settings>('/api/settings'),
    staleTime: STALE,
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<PublicUser>('/api/auth/me'),
    retry: false,
    staleTime: STALE,
  })
}

// ─── Derived helpers ────────────────────────────────────────────────────────

export function useTeamColorMap(teams: Team[] | undefined) {
  const map = new Map<string, string>()
  for (const t of teams ?? []) map.set(t.name, t.color)
  return map
}

export function teamColor(map: Map<string, string>, name: string) {
  return map.get(name) ?? '#64748b'
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1] ?? ''} ${y}`
}

export function formatDateLong(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const date = new Date(Date.UTC(y, m - 1, d))
  return `${names[date.getUTCDay()]} ${d} de ${MONTHS[m - 1]} ${y}`
}

export const pts = (s: Standing) => s.g * 3 + s.e
export const gd = (s: Standing) => s.gf - s.gc
