#!/usr/bin/env node
/**
 * Console check for the IPSA web public API.
 *
 * Verifies the same public endpoints the frontend consumes, resolving the
 * base URL from NEXT_PUBLIC_API_URL in .env.local (falling back to the
 * default in src/lib/api.ts). Exits non-zero if any endpoint fails.
 *
 * Usage:
 *   pnpm check:api            # uses .env.local / default localhost:8787
 *   NEXT_PUBLIC_API_URL=... pnpm check:api
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function loadBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  try {
    const content = readFileSync(`${root}/.env.local`, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*NEXT_PUBLIC_API_URL\s*=\s*"?([^"\n]+)"?\s*$/)
      if (m) return m[1]
    }
  } catch {
    // .env.local missing is fine
  }
  return 'http://localhost:8787'
}

const BASE_URL = loadBaseUrl().replace(/\/+$/, '')
const ENDPOINTS = [
  { path: '/api/health', label: 'health' },
  { path: '/api/teams', label: 'teams' },
  { path: '/api/groups', label: 'groups' },
  { path: '/api/matches', label: 'matches' },
  { path: '/api/standings', label: 'standings' },
  { path: '/api/scorers', label: 'scorers' },
  { path: '/api/bracket', label: 'bracket' },
  { path: '/api/settings', label: 'settings' },
]

const results = []
for (const { path, label } of ENDPOINTS) {
  const url = `${BASE_URL}${path}`
  try {
    const res = await fetch(url)
    const ok = res.ok
    let detail = `HTTP ${res.status}`
    if (ok && res.status !== 204) {
      const data = await res.json()
      if (Array.isArray(data)) detail = `${res.status} (${data.length} items)`
      else if (data && typeof data === 'object') detail = `${res.status} (ok)`
    }
    results.push({ label, url, ok, detail })
  } catch (err) {
    results.push({ label, url, ok: false, detail: `error: ${err.message}` })
  }
}

const failed = results.filter((r) => !r.ok)
const maxLabel = Math.max(...results.map((r) => r.label.length))

for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.label.padEnd(maxLabel)}  ${r.url}  ${r.detail}`)
}

console.log(`\n→ Base URL: ${BASE_URL}`)
if (failed.length === 0) {
  console.log(`✓ Todos los endpoints responden (${results.length}/${results.length})`)
} else {
  console.log(`✗ ${failed.length} de ${results.length} endpoints fallaron`)
  process.exitCode = 1
}
