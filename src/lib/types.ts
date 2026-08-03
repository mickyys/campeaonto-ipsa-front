export type PlayerPos = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero'

export interface Player {
  id: string
  num: number
  name: string
  pos: PlayerPos
}

export interface Team {
  id: string
  name: string
  color: string
  players: Player[]
}

export interface Group {
  id: string
  label: string
  teamIds: string[]
}

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  group: string
  cancha: string
  homeScore?: number
  awayScore?: number
  status: 'upcoming' | 'completed'
}

export interface BracketMatch {
  id: string
  home: string | null
  away: string | null
  homeScore?: number
  awayScore?: number
  status: 'upcoming' | 'completed' | 'tbd'
  winner?: string
}

export type Bracket = BracketMatch[][]

export interface Scorer {
  id: string
  name: string
  team: string
  goals: number
  assists: number
}

export interface Settings {
  logoUrl?: string
  contactEmail?: string
  orgName?: string
  editionLabel?: string
}

export interface Standing {
  team: string
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
}

export type Standings = Record<string, Standing[]>

export interface PublicUser {
  id: string
  email: string
  name: string
  role: 'admin'
}
