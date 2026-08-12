// React
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Providers
import { useAuth } from './auth-provider'

// Hooks
import { useSettingsQuery } from '#/features/settings/hooks/use-settings-query'

// Lib
import {
  LANGUAGE_OVERRIDE_KEY,
  localeToLanguage,
  resolveLanguage,
} from '#/shared/lib/resolve-language.lib'

// Types
import type { ReactNode } from 'react'
import type { AppLanguage } from '#/shared/lib/resolve-language.lib'

type LanguagePreference = {
  /** Idioma em uso agora. */
  language: AppLanguage
  /** Idioma que a empresa definiu, quando ela definiu um que existe aqui. */
  companyLanguage: AppLanguage | undefined
  /** Escolha manual de quem usa, ou `null` quando se está seguindo a empresa. */
  override: AppLanguage | null
  /** Troca o idioma. `null` apaga a escolha e volta a seguir a empresa. */
  setLanguage: (next: AppLanguage | null) => void
}

const LanguageContext = createContext<LanguagePreference | null>(null)

/** Lê a escolha manual guardada, ignorando valor que não seja idioma nosso. */
function readOverride(): AppLanguage | null {
  if (typeof window === 'undefined') return null

  return localeToLanguage(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY)) ?? null
}

/**
 * Decide o idioma da interface a partir da escolha de quem usa e do idioma da
 * empresa.
 *
 * Fica acima do `AuthGuard` porque o seletor também aparece no login, onde não
 * há empresa — ali vale o idioma de partida, e o provedor não consulta nada.
 *
 * **A escolha manual tem chave própria, e é escrita só aqui.** O detector do
 * i18next grava a cada `changeLanguage` quando configurado com `caches`; se o
 * idioma da empresa fosse aplicado por esse caminho, viraria escolha manual, e
 * a opção "Padrão" perderia como se distinguir de uma escolha de verdade.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()

  const settingsQuery = useSettingsQuery({ enabled: isAuthenticated })
  const companyLocale = settingsQuery.data?.company?.locale

  /*
    O que está guardado vira estado, e não leitura direta a cada renderização:
    escolher "Padrão" estando já no idioma da empresa não muda o idioma, então
    o i18next não emitiria evento nenhum — e o seletor continuaria marcando a
    escolha antiga.
  */
  const [override, setOverride] = useState<AppLanguage | null>(readOverride)
  const companyLanguage = localeToLanguage(companyLocale)

  const language = resolveLanguage({
    override,
    companyLocale,
    fallback: i18n.language,
  })

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
    () => ({ language, companyLanguage, override, setLanguage }),
    [language, companyLanguage, override, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/**
 * Preferência de idioma: o que está em uso, o que a empresa definiu e como
 * trocar.
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
