const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'
).replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Short-lived access token (15 min). Stored in memory; the httpOnly refresh
// cookie is used to obtain a new one transparently on 401.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken?: string }
    if (!data.accessToken) return false
    accessToken = data.accessToken
    return true
  } catch {
    return false
  }
}

const NO_RETRY = ['/api/auth/login', '/api/auth/refresh']

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let attempt = 0
  while (true) {
    attempt++
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

    const res = await fetch(`${BASE_URL}${path}`, {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers,
      body: init.body,
    })

    if (res.status === 401 && attempt === 1 && !NO_RETRY.includes(path)) {
      const refreshed = await refreshAccessToken()
      if (refreshed) continue
    }

    if (!res.ok) {
      let message = `Error ${res.status}`
      try {
        const data = (await res.json()) as { error?: string }
        if (data?.error) message = data.error
      } catch {
        // ignore body parse errors
      }
      throw new ApiError(res.status, message)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }
}

export const API_BASE = BASE_URL
