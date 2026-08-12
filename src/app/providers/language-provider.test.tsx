// React
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Provider
import { LanguageProvider, useLanguagePreference } from './language-provider'

// Lib
import { LANGUAGE_OVERRIDE_KEY } from '#/shared/lib/resolve-language.lib'

// Types
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

/** Idioma que o i18next diz estar em uso; começa no detectado do navegador. */
let currentLanguage = 'en'
const changeLanguage = vi.fn(async (next: string) => {
  currentLanguage = next
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      get language() {
        return currentLanguage
      },
      changeLanguage,
    },
  }),
}))

let isAuthenticated = false
vi.mock('./auth-provider', () => ({
  useAuth: () => ({ isAuthenticated }),
}))

let companyLocale: string | undefined
const settingsQuery = vi.fn()
vi.mock('#/features/settings/hooks/use-settings-query', () => ({
  useSettingsQuery: (options?: { enabled?: boolean }) => {
    settingsQuery(options)
    return { data: companyLocale ? { company: { locale: companyLocale } } : undefined }
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function render() {
  return renderHook(() => useLanguagePreference(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    ),
  })
}

/** Simula abrir o CRM de novo: novo provedor, mesmo armazenamento. */
function reopen(browserLanguage = 'en') {
  currentLanguage = browserLanguage
  return render()
}

beforeEach(() => {
  window.localStorage.clear()
  changeLanguage.mockClear()
  settingsQuery.mockClear()
  currentLanguage = 'en'
  isAuthenticated = false
  companyLocale = undefined
})

describe('primeiro acesso, antes de entrar', () => {
  it('vale o idioma detectado do navegador', () => {
    const { result } = reopen('pt')

    expect(result.current.language).toBe('pt')
    expect(result.current.override).toBeNull()
  })

  it('não consulta as configurações sem sessão', () => {
    // A tela de login fica dentro do provedor: sem isto, sairia uma chamada
    // sem token a cada abertura.
    reopen()

    expect(settingsQuery).toHaveBeenCalledWith({ enabled: false })
  })

  it('não anuncia idioma de empresa, porque não há empresa', () => {
    const { result } = reopen()

    expect(result.current.companyLanguage).toBeUndefined()
  })
})

describe('depois de entrar', () => {
  beforeEach(() => {
    isAuthenticated = true
  })

  it('o idioma da empresa substitui o do navegador, sozinho', () => {
    companyLocale = 'pt-BR'

    const { result } = reopen('en')

    expect(result.current.language).toBe('pt')
    expect(changeLanguage).toHaveBeenCalledWith('pt')
  })

  it('a escolha manual passa por cima da empresa', () => {
    companyLocale = 'pt-BR'

    const { result } = reopen('pt')
    act(() => result.current.setLanguage('en'))

    expect(result.current.language).toBe('en')
    expect(result.current.override).toBe('en')
  })

  it('a escolha manual fica guardada', () => {
    companyLocale = 'pt-BR'

    const { result } = reopen('pt')
    act(() => result.current.setLanguage('en'))

    expect(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY)).toBe('en')
  })

  it('escolher "Padrão" apaga a escolha e devolve a decisão à empresa', () => {
    companyLocale = 'pt-BR'

    const { result } = reopen('en')
    act(() => result.current.setLanguage('en'))
    act(() => result.current.setLanguage(null))

    expect(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY)).toBeNull()
    expect(result.current.language).toBe('pt')
  })

  it('trocar o idioma da empresa move quem não escolheu', () => {
    companyLocale = 'pt-BR'
    const first = reopen('en')
    expect(first.result.current.language).toBe('pt')

    companyLocale = 'en-US'
    const second = reopen('pt')
    expect(second.result.current.language).toBe('en')
  })

  it('trocar o idioma da empresa não move quem escolheu', () => {
    window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, 'en')
    companyLocale = 'pt-BR'

    const { result } = reopen('pt')

    expect(result.current.language).toBe('en')
  })
})

describe('próximos acessos', () => {
  beforeEach(() => {
    isAuthenticated = true
  })

  it('a escolha guardada vale desde a primeira renderização', () => {
    window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, 'en')
    companyLocale = 'pt-BR'

    const { result } = reopen('pt')

    expect(result.current.language).toBe('en')
    expect(result.current.override).toBe('en')
  })

  it('sem escolha guardada, vale a empresa', () => {
    companyLocale = 'en-US'

    const { result } = reopen('pt')

    expect(result.current.language).toBe('en')
  })

  it('escolha guardada que não é idioma nosso é ignorada', () => {
    // Chave adulterada não pode travar a tela num idioma que não existe.
    window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, 'fr')
    companyLocale = 'pt-BR'

    const { result } = reopen('en')

    expect(result.current.language).toBe('pt')
    expect(result.current.override).toBeNull()
  })
})
