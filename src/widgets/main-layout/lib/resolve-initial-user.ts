// Lib
import { getStoredAuthSession } from '#/shared/lib/auth-storage'

/**
 * Resolve o ID do usuário de forma síncrona a partir da sessão em storage,
 * útil para inicializar a barra lateral com a preferência correta já no
 * primeiro render (antes do AuthProvider popular o contexto), evitando o
 * "flash" de expandida→retraída durante o skeleton de carregamento.
 *
 * @returns O ID do usuário autenticado, ou `null` se não houver sessão.
 */
export function resolveInitialUserId(): string | null {
  try {
    return getStoredAuthSession()?.user?.id ?? null
  } catch {
    return null
  }
}
