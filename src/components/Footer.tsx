'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/lib/hooks'

const NAVY = '#1e3a8a'

export default function Footer() {
  const { data: settings } = useSettings()
  const email = settings?.contactEmail || 'centrodepadresipsasai@gmail.com'

  return (
    <footer
      style={{
        borderTop: '1px solid #e2e8f0',
        background: '#fff',
        padding: '20px clamp(16px,4vw,32px)',
        marginTop: 32,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image
            src="/ipsa-logo.png"
            alt="IPSA"
            width={28}
            height={28}
            style={{ objectFit: 'contain' }}
          />
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Centro de Padres IPSA San Antonio · Campeonato Apoderados 2026
          </span>
        </div>
        <a
          href={`mailto:${email}`}
          style={{
            fontSize: 12,
            color: NAVY,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {email}
        </a>
        <Link
          href="/admin"
          style={{
            fontSize: 11,
            color: '#cbd5e1',
            textDecoration: 'none',
            cursor: 'pointer',
            padding: 0,
            marginLeft: 8,
          }}
        >
          Administrador
        </Link>
      </div>
    </footer>
  )
}
