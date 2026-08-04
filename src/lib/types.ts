export interface Player {
  id: string
  num: number
  name: string
  guardianType?: string
  studentName?: string
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
  referee?: string
  homeScore?: number
  awayScore?: number
  status: 'upcoming' | 'completed'
}

export interface FreeTeams {
  id: string
  byGroup: Record<string, string[]>
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

export interface BracketRound {
  name?: string
  matches: BracketMatch[]
}

export type Bracket = BracketRound[]

export type BracketCopaId = 'oro' | 'plata' | 'bronce'

export type CopaBrackets = Record<BracketCopaId, Bracket>

export interface Scorer {
  id: string
  name: string
  team: string
  goals: number
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
