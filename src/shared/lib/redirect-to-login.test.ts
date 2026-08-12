import { describe, expect, it, beforeEach, vi } from 'vitest'
import { redirectToLogin } from './redirect-to-login'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockClearAuthSession = vi.hoisted(() => vi.fn())

vi.mock('./auth-storage', () => ({
  clearAuthSession: mockClearAuthSession,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setLocationPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { pathname, href: '' },
    writable: true,
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('redirectToLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setLocationPathname('/contacts')
  })

  it('should clear auth session and redirect when not on login page', () => {
    setLocationPathname('/contacts')

    redirectToLogin()

    expect(mockClearAuthSession).toHaveBeenCalledOnce()
    expect(window.location.href).toBe('/')
  })

  it('should clear auth session and redirect from any authenticated route', () => {
    setLocationPathname('/settings/profile')

    redirectToLogin()

    expect(mockClearAuthSession).toHaveBeenCalledOnce()
    expect(window.location.href).toBe('/')
  })

  it('should NOT redirect when already on the login page', () => {
    setLocationPathname('/')

    redirectToLogin()

    expect(mockClearAuthSession).not.toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })

  it('should NOT do anything when window is undefined (SSR)', () => {
    const originalWindow = global.window
    // @ts-expect-error - simulating SSR where window is undefined
    global.window = undefined

    redirectToLogin()

    expect(mockClearAuthSession).not.toHaveBeenCalled()

    global.window = originalWindow
  })
})
