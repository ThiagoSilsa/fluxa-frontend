// React
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Components
import { AuthGuard } from './auth-guard'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUseAuth = vi.fn()

vi.mock('#/app/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{`Redirect to ${to}`}</div>,
}))

// ---------------------------------------------------------------------------
// AuthGuard
// ---------------------------------------------------------------------------
describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing while not ready', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isReady: false })

    const { container } = render(
      <AuthGuard>
        <div data-testid="content">Protected Content</div>
      </AuthGuard>,
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('content')).toBeNull()
    expect(screen.queryByTestId('navigate')).toBeNull()
  })

  it('should redirect to / when not authenticated and ready', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isReady: true })
    render(
      <AuthGuard>
        <div data-testid="content">Protected Content</div>
      </AuthGuard>,
    )

    const navigate = screen.getByTestId('navigate')
    expect(navigate.textContent).toBe('Redirect to /')
    expect(screen.queryByTestId('content')).toBeNull()
  })

  it('should render children when authenticated and ready', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isReady: true })

    render(
      <AuthGuard>
        <div data-testid="content">Protected Content</div>
      </AuthGuard>,
    )

    const content = screen.getByTestId('content')
    expect(content.textContent).toBe('Protected Content')
    expect(screen.queryByTestId('navigate')).toBeNull()
  })
})
