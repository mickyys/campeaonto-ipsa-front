import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Campeonato de Apoderados IPSA San Antonio 2026'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export async function renderOgImage() {
  const [fontData, logoData] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/BarlowCondensed-ExtraBold.ttf')),
    readFile(join(process.cwd(), 'public/ipsa-logo.png')),
  ])
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #0f2454 0%, #0d1c38 55%, #0b1830 100%)',
          fontFamily: '"Barlow Condensed"',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#f5c842',
          }}
        />
        <img
          src={logoSrc}
          width={140}
          height={140}
          alt="Logo IPSA"
          style={{ objectFit: 'contain', marginBottom: 28, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.45))' }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            lineHeight: 0.92,
            textAlign: 'center',
          }}
        >
          <span>Campeonato de</span>
          <span>Apoderados</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 26,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '.12em',
            color: '#f5c842',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 90,
              height: 3,
              background: 'rgba(245,200,66,.55)',
            }}
          />
          <span>IPSA 2026</span>
          <span
            style={{
              width: 90,
              height: 3,
              background: 'rgba(245,200,66,.55)',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '.14em',
            color: 'rgba(255,255,255,.6)',
            textTransform: 'uppercase',
          }}
        >
          Instituto del Puerto · San Antonio
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Barlow Condensed',
          data: fontData,
          style: 'normal',
          weight: 800,
        },
      ],
    },
  )
}
