'use client'

import Link from 'next/link'

const NAVY = '#1e3a8a'

export function PageHeader({ title, backTo = '/' }: { title: string; backTo?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Link
        href={backTo}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: 13,
          padding: 0,
          marginBottom: 5,
          fontWeight: 500,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        ← Inicio
      </Link>
      <h1
        style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(26px,5vw,40px)',
          textTransform: 'uppercase',
          letterSpacing: '.01em',
          margin: 0,
          color: NAVY,
        }}
      >
        {title}
      </h1>
    </div>
  )
}
