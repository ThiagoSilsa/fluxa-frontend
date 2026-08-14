/**
 * Persistência da preferência de barra lateral (expandida/retraída) por
 * usuário, em `localStorage`. A escolha é vinculada ao `userId`, de modo que
 * usuários diferentes no mesmo navegador mantêm preferências independentes.
 */

const STORAGE_PREFIX = 'sidebar-open'

/** Monta a chave de armazenamento para um usuário. */
function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`
}

/**
 * Lê a preferência de barra lateral do usuário.
 *
 * @param userId - ID do usuário autenticado (null/vazio → sem preferência).
 * @returns `true` (expandida), `false` (retraída) ou `null` quando não há
 *   preferência salva (ou o valor é inválido / o storage está indisponível).
 */
export function getSidebarPreference(userId: string | null | undefined): boolean | null {
  if (!userId) return null

  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw === 'true') return true
    if (raw === 'false') return false
    return null
  } catch {
    return null
  }
}

/**
 * Salva a preferência de barra lateral do usuário.
 *
 * @param userId - ID do usuário autenticado (null/vazio → no-op).
 * @param open - `true` para expandida, `false` para retraída.
 */
export function setSidebarPreference(userId: string | null | undefined, open: boolean): void {
  if (!userId) return

  try {
    localStorage.setItem(storageKey(userId), open ? 'true' : 'false')
  } catch {
    // Best-effort: se o storage estiver indisponível, apenas ignora.
  }
}
