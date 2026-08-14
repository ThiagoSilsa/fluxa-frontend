// React
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Provider
import { LanguageProvider, useLanguagePreference } from './language-provider'

// Lib
import { LANGUAGE_OVERRIDE_KEY } from '#/shared/lib/language.lib'

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function render(browserLanguage = 'en') {
  currentLanguage = browserLanguage
  return renderHook(() => useLanguagePreference(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    ),
  })
}

beforeEach(() => {
  window.localStorage.clear()
  changeLanguage.mockClear()
  currentLanguage = 'en'
})

describe('LanguageProvider', () => {
  it('vale o idioma detectado do navegador e não anuncia escolha manual', () => {
    const { result } = render('pt')

    expect(result.current.language).toBe('pt')
    expect(result.current.override).toBeNull()
  })

  it('a escolha manual passa por cima do idioma detectado', () => {
    const { result } = render('en')

    act(() => result.current.setLanguage('pt'))

    expect(result.current.language).toBe('pt')
    expect(result.current.override).toBe('pt')
  })

  it('a escolha manual fica guardada no localStorage', () => {
    const { result } = render()

    act(() => result.current.setLanguage('pt'))

    expect(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY)).toBe('pt')
  })

  it('escolher "Padrão" apaga a escolha e volta ao idioma detectado', () => {
    const { result } = render('en')

    act(() => result.current.setLanguage('pt'))
    act(() => result.current.setLanguage(null))

    expect(window.localStorage.getItem(LANGUAGE_OVERRIDE_KEY)).toBeNull()
    expect(result.current.override).toBeNull()
    expect(result.current.language).toBe('en')
  })

  it('a escolha guardada vale desde a primeira renderização', () => {
    window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, 'en')

    const { result } = render('pt')

    expect(result.current.language).toBe('en')
    expect(result.current.override).toBe('en')
  })

  it('escolha guardada que não é idioma nosso é ignorada', () => {
    // Chave adulterada não pode travar a tela num idioma que não existe.
    window.localStorage.setItem(LANGUAGE_OVERRIDE_KEY, 'fr')

    const { result } = render('en')

    expect(result.current.language).toBe('en')
    expect(result.current.override).toBeNull()
  })
})
