'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/lib/hooks'
import { api, setAccessToken } from '@/lib/api'
import LoginScreen from '@/views/admin/LoginScreen'
import TeamsTab from '@/views/admin/TeamsTab'
import GroupsTab from '@/views/admin/GroupsTab'
import MatchesTab from '@/views/admin/MatchesTab'
import StandingsTab from '@/views/admin/StandingsTab'
import BracketTab from '@/views/admin/BracketTab'
import ScorersTab from '@/views/admin/ScorersTab'
import ShareTab from '@/views/admin/ShareTab'
import { LoadingState } from '@/components/ui'

type TabId = 'teams' | 'groups' | 'matches' | 'standings' | 'bracket' | 'scorers' | 'share'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'teams', label: 'Equipos', icon: '🏃' },
  { id: 'groups', label: 'Grupos', icon: '🗂️' },
  { id: 'matches', label: 'Fixture', icon: '📅' },
  { id: 'standings', label: 'Posiciones', icon: '📊' },
  { id: 'bracket', label: 'Bracket', icon: '🏆' },
  { id: 'scorers', label: 'Goleadores', icon: '⚽' },
  { id: 'share', label: 'Compartir', icon: '📤' },
]

const NAVY = '#1e3a8a'

export default function AdminView() {
  const me = useMe()
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabId>('teams')
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogin = () => {
    qc.invalidateQueries()
    qc.removeQueries({ queryKey: ['me'] })
    me.refetch()
  }

  const logout = async () => {
    setLoggingOut(true)
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setAccessToken(null)
    qc.clear()
    qc.removeQueries({ queryKey: ['me'] })
    me.refetch()
    setLoggingOut(false)
  }

  if (me.isPending) return <LoadingState />

  if (me.error || !me.data) {
    return <LoginScreen onSuccess={handleLogin} />
  }

  const user = me.data

  return (
    <div>
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: NAVY,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {(user.name?.[0] ?? user.email?.[0] ?? 'A').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{user.name ?? 'Administrador'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{user.email}</div>
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          style={{
            background: 'none',
            border: '1.5px solid #e2e8f0',
            color: '#64748b',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: 8,
              border: '1.5px solid',
              borderColor: tab === t.id ? NAVY : '#e2e8f0',
              background: tab === t.id ? NAVY : '#fff',
              color: tab === t.id ? '#fff' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="anim-up" key={tab}>
        {tab === 'teams' && <TeamsTab />}
        {tab === 'groups' && <GroupsTab />}
        {tab === 'matches' && <MatchesTab />}
        {tab === 'standings' && <StandingsTab />}
        {tab === 'bracket' && <BracketTab />}
        {tab === 'scorers' && <ScorersTab />}
        {tab === 'share' && <ShareTab />}
      </div>
    </div>
  )
}
