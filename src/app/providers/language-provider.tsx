// React
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { LANGUAGE_OVERRIDE_KEY, localeToLanguage } from '#/shared/lib/language.lib'

// Types
import type { ReactNode } from 'react'
import type { AppLanguage } from '#/shared/lib/language.lib'

type LanguagePreference = {
  /** Idioma em uso agora. */
  language: AppLanguage
  /** Escolha manual de quem usa, ou `null` quando se está seguindo o idioma detectado. */
  override: AppLanguage | null
  /** Troca o idioma. `null` apaga a escolha e volta ao idioma detectado. */
  setLanguage: (next: AppLanguage | null) => void
}

const LanguageContext = createContext<LanguagePreference | null>(null)

/** Lê a escolha manual guardada, ignorando valor que não seja idioma nosso. */
function readOverride(): AppLanguage | null {
  if (typeof window === 'undefined') return null

  return localeToLanguage(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY))
}

/**
 * Decide o idioma da interface a partir da escolha manual e do idioma do
 * navegador.
 *
 * Fica acima do `AuthGuard` porque o seletor também aparece no login, onde não
 * há empresa — ali vale o idioma de partida, e o provedor não consulta nada.
 *
 * **A escolha manual tem chave própria, e é escrita só aqui.** O detector do
 * i18next grava a cada `changeLanguage` quando configurado com `caches`; se o
 * idioma da empresa fosse aplicado por esse caminho, viraria escolha manual, e
 * a opção "Padrão" perderia como se distinguir de uma escolha de verdade.
 */
// TODO: Aplicar o idioma definido pela empresa quando a feature de settings existir (useSettingsQuery).
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()

  /*
    O idioma detectado fica fixo na montagem: a escolha manual sobrescreve o
    idioma corrente (o i18next muda `i18n.language`), então "Padrão" precisa
    voltar ao idioma do navegador, e não ao último idioma aplicado.

    O que está guardado vira estado, e não leitura direta a cada renderização:
    escolher "Padrão" estando já no idioma da empresa não muda o idioma, então
    o i18next não emitiria evento nenhum — e o seletor continuaria marcando a
    escolha antiga.
  */
  const [initialLanguage] = useState<AppLanguage>(() => localeToLanguage(i18n.language) ?? 'en')
  const [override, setOverride] = useState<AppLanguage | null>(readOverride)

  const language = override ?? initialLanguage

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
  }, [i18n, language])

  const setLanguage = useCallback((next: AppLanguage | null) => {
    if (next) {
      window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, next)
    } else {
      window.localStorage.removeItem(LANGUAGE_OVERRIDE_KEY)
    }

    // O efeito acima aplica em seguida, a partir do estado novo.
    setOverride(next)
  }, [])

  const value = useMemo<LanguagePreference>(
    () => ({ language, override, setLanguage }),
    [language, override, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/**
 * Preferência de idioma: o que está em uso e como trocar.
 *
 * @returns A preferência de idioma.
 */
export function useLanguagePreference(): LanguagePreference {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguagePreference precisa estar dentro de LanguageProvider')
  }

  return context
}
