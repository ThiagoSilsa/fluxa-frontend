/**
 * Constantes e helpers do idioma da interface.
 *
 * Os idiomas suportados são os registrados no i18n
 * (`supportedLngs: ['pt', 'en', 'es']`) — esta lista é a fonte única usada pelo
 * seletor, pela normalização de locale e pelos testes.
 */

/** Chave no `localStorage` da escolha manual de idioma. */
export const LANGUAGE_OVERRIDE_KEY = 'languageOverride'

/** Idiomas suportados pela interface. */
export type AppLanguage = 'pt' | 'en' | 'es'

/** Idiomas suportados, na ordem exibida no seletor de idioma. */
export const APP_LANGUAGES: AppLanguage[] = ['pt', 'en', 'es']

/**
 * Normaliza um locale (ex.: `pt-BR`, `en-US`, `es-AR`) para um idioma da
 * interface.
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

  if (normalized.startsWith('es')) {
    return 'es'
  }

  return null
}

/**
 * Locale BCP-47 do idioma — para `Intl` (datas) e para o atributo `lang` do
 * documento.
 *
 * Um idioma só, uma região de referência: português do Brasil, inglês dos
 * Estados Unidos e espanhol da Espanha (os formatos numéricos coincidem com os
 * da América Latina, e o espanhol da interface é neutro).
 *
 * @param locale Locale bruto (`pt`, `pt-BR`, `es-AR`…).
 * @returns Locale de formatação; idioma não suportado cai no do inglês.
 */
export function toLocaleTag(locale: string | null | undefined): string {
  const language = localeToLanguage(locale)

  if (language === 'pt') {
    return 'pt-BR'
  }

  if (language === 'es') {
    return 'es-ES'
  }

  return 'en-US'
}
