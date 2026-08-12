/**
 * Constantes e helpers do idioma da interface.
 *
 * Os idiomas suportados são os registrados no i18n (`supportedLngs: ['pt', 'en']`).
 */

/** Chave no `localStorage` da escolha manual de idioma. */
export const LANGUAGE_OVERRIDE_KEY = 'languageOverride'

/** Idiomas suportados pela interface. */
export type AppLanguage = 'pt' | 'en'

/** Idiomas suportados, na ordem exibida no seletor de idioma. */
export const APP_LANGUAGES: AppLanguage[] = ['pt', 'en']

/**
 * Normaliza um locale (ex.: `pt-BR`, `en-US`) para um idioma da interface.
 *
 * @param locale Locale bruto (pode ser `null` ou `undefined`).
 * @returns O idioma correspondente, ou `null` quando não é um idioma suportado.
 */
export function localeToLanguage(locale: string | null | undefined): AppLanguage | null {
  if (!locale) {
    return null
  }

  const normalized = locale.toLowerCase()

  if (normalized.startsWith('pt')) {
    return 'pt'
  }

  if (normalized.startsWith('en')) {
    return 'en'
  }

  return null
}
