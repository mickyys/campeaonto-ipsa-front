'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/grupos', label: 'Grupos' },
  { href: '/fixture', label: 'Fixture' },
  { href: '/bracket', label: 'Bracket' },
]

const NAVY = '#1e3a8a'
const AMBER = '#d97706'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(15,23,42,.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 clamp(16px,4vw,32px)',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <Image
            src="/ipsa-logo.png"
            alt="IPSA"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: '.03em',
                textTransform: 'uppercase',
                color: NAVY,
              }}
            >
              Campeonato Apoderados
            </div>
            <div
              style={{
                fontSize: 10,
                color: AMBER,
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              IPSA SAI 2025
            </div>
          </div>
        </Link>

        <div className="hidden-mobile" style={{ gap: 2 }}>
          {LINKS.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: active ? '#eff6ff' : 'transparent',
                  color: active ? NAVY : '#64748b',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#0f172a'
                    e.currentTarget.style.background = '#f8fafc'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        <button
          className="show-mobile"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#334155',
            fontSize: 18,
            padding: 8,
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            background: '#fff',
            padding: '6px 16px 10px',
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '11px 8px',
                borderRadius: 8,
                background: isActive(l.href) ? '#eff6ff' : 'transparent',
                color: isActive(l.href) ? NAVY : '#64748b',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: 2,
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
