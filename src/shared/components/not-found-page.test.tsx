// React
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Component
import { NotFoundPage } from './not-found-page'

// Types
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

/** Sessão devolvida pelo provedor (substituída por cenário). */
let auth: { isAuthenticated: boolean; isReady: boolean; user: unknown } = {
  isAuthenticated: false,
  isReady: true,
  user: null,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}))

vi.mock('#/app/providers/auth-provider', () => ({
  useAuth: () => auth,
}))

// O widget de layout traz sidebar, busca e i18n próprios: aqui interessa a
// **composição** (a 404 entra no lugar da página que faltou), não o desenho da
// sidebar — que é responsabilidade do widget e não muda nesta correção.
vi.mock('#/widgets/main-layout/components/main-layout', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="main-layout">
      <nav aria-label="app-navigation" />
      {children}
    </div>
  ),
}))

// `Link` real exige contexto de roteador; o teste só confere o destino.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

beforeEach(() => {
  vi.clearAllMocks()
  auth = { isAuthenticated: false, isReady: true, user: null }
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NotFoundPage', () => {
  it('com sessão, renderiza a 404 dentro do layout principal', () => {
    auth = { isAuthenticated: true, isReady: true, user: { id: 'user-1' } }

    render(<NotFoundPage />)

    const layout = screen.getByTestId('main-layout')
    // A navegação da aplicação continua montada...
    expect(screen.getByRole('navigation', { name: 'app-navigation' })).toBeTruthy()
    // ...e o conteúdo da 404 entra no lugar da página que faltou.
    expect(layout.contains(screen.getByText('notFound.title'))).toBe(true)
    expect(screen.getByText('404')).toBeTruthy()
  })

  it('sem sessão, renderiza o cartão autônomo (sem layout de aplicação)', () => {
    render(<NotFoundPage />)

    expect(screen.queryByTestId('main-layout')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByText('notFound.title')).toBeTruthy()
    expect(screen.getByText('notFound.description')).toBeTruthy()
  })

  it('leva de volta ao início pelo CTA', () => {
    render(<NotFoundPage />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/home')
    expect(link.textContent).toBe('notFound.action')
  })

  it('espera a sessão ficar pronta antes de escolher o layout', () => {
    auth = { isAuthenticated: false, isReady: false, user: null }

    const { container } = render(<NotFoundPage />)

    // Sem sessão avaliada ainda: nem cartão público, nem layout de aplicação.
    expect(container.innerHTML).toBe('')
  })
})
