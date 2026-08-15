// React
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// HOC
import { withRouteAccess } from './route-access'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUseAuth = vi.fn()

vi.mock('#/app/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('#/shared/components', () => ({
  AuthBlock: () => <div data-testid="auth-block">No access</div>,
}))

const MockPage = () => <div data-testid="page">Page content</div>

// ---------------------------------------------------------------------------
// withRouteAccess
// ---------------------------------------------------------------------------
describe('withRouteAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render nothing while auth is not ready', () => {
    mockUseAuth.mockReturnValue({ isReady: false, user: null })

    const Protected = withRouteAccess({ permissions: ['MANAGE_ROLES'] }, MockPage)
    const { container } = render(<Protected />)

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('page')).toBeNull()
    expect(screen.queryByTestId('auth-block')).toBeNull()
  })

  it('should render AuthBlock for anonymous user', () => {
    mockUseAuth.mockReturnValue({ isReady: true, user: null })

    const Protected = withRouteAccess({ permissions: ['MANAGE_ROLES'] }, MockPage)
    render(<Protected />)

    expect(screen.getByTestId('auth-block')).toBeTruthy()
    expect(screen.queryByTestId('page')).toBeNull()
  })

  it('should render AuthBlock when user lacks the permission', () => {
    mockUseAuth.mockReturnValue({
      isReady: true,
      user: { permissionCodes: ['MANAGE_USERS'] },
    })

    const Protected = withRouteAccess({ permissions: ['MANAGE_ROLES'] }, MockPage)
    render(<Protected />)

    expect(screen.getByTestId('auth-block')).toBeTruthy()
    expect(screen.queryByTestId('page')).toBeNull()
  })

  it('should render the component when user has the permission', () => {
    mockUseAuth.mockReturnValue({
      isReady: true,
      user: { permissionCodes: ['MANAGE_ROLES'] },
    })

    const Protected = withRouteAccess({ permissions: ['MANAGE_ROLES'] }, MockPage)
    render(<Protected />)

    expect(screen.getByTestId('page')).toBeTruthy()
    expect(screen.queryByTestId('auth-block')).toBeNull()
  })

  it('should grant access when requirements are empty', () => {
    mockUseAuth.mockReturnValue({ isReady: true, user: null })

    const Protected = withRouteAccess({}, MockPage)
    render(<Protected />)

    expect(screen.getByTestId('page')).toBeTruthy()
    expect(screen.queryByTestId('auth-block')).toBeNull()
  })
})
