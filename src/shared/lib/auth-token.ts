// Types
import type { AuthTokenPayload } from '../types/auth.types'

// Schema
import { authTokenPayloadSchema } from '#/shared/schemas/auth-token.schema'

/**
 * Tenta parsear o token como JSON stringificado e validar seu formato.
 */
function parseJsonPayload(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    const result = authTokenPayloadSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

/**
 * Tenta extrair o payload de um token JWT ou de um JSON stringificado.
 */
export function parseTokenPayload(token: string): AuthTokenPayload | null {
  if (!token) {
    return null
  }

  const trimmed = token.trim()

  const parts = trimmed.split('.')
  // Se tiver 3 partes, é um JWT. Se tiver 1 parte, é um JSON stringificado. Qualquer outro formato é inválido.
  if (parts.length < 2) {
    return null
  }

  // Tenta parsear como JWT primeiro, e se falhar tenta como JSON stringificado.
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return parseJsonPayload(json)
  } catch {
    return null
  }
}

/**
 * Verifica se o token existe, pode ser parseado e nao expirou.
 */
export function isTokenValid(token: string | null) {
  if (!token) {
    return false
  }

  const payload = parseTokenPayload(token)
  if (!payload) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}
