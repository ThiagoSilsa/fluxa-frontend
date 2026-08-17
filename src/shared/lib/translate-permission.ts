// i18n
import i18n from 'i18next'

/**
 * Traduz o código de uma permissão para a chave i18n correspondente.
 *
 * O catálogo de permissões é espelho de `PermissionCode` do backend; a chave
 * vive no namespace `roles` (ex.: `roles:permissions.MANAGE_ROLES`).
 *
 * @param code - Código da permissão (ex.: `MANAGE_ROLES`).
 * @returns Chave i18n do namespace `roles`.
 */
export function translatePermission(code: string): string {
  return `roles:permissions.${code}`
}

/**
 * Resolve o rótulo traduzido de uma permissão.
 *
 * Se não houver tradução cadastrada para o código (permissão nova no backend,
 * ainda sem chave no i18n), devolve o próprio código como fallback — evita
 * exibir a chave crua na tela.
 *
 * @param code - Código da permissão.
 * @returns Rótulo traduzido ou o código.
 */
export function translatePermissionLabel(code: string): string {
  const key = `${translatePermission(code)}.title`

  if (i18n.exists(key)) {
    return i18n.t(key)
  }

  return code
}

/**
 * Resolve a descrição traduzida de uma permissão.
 *
 * Se não houver tradução cadastrada (permissão nova no backend, ainda sem
 * chave no i18n), devolve `null` — quem exibe decide o fallback (ex.: a
 * descrição crua vinda da API).
 *
 * @param code - Código da permissão.
 * @returns Descrição traduzida ou `null`.
 */
export function translatePermissionDescription(code: string): string | null {
  const key = `${translatePermission(code)}.description`

  if (i18n.exists(key)) {
    return i18n.t(key)
  }

  return null
}
