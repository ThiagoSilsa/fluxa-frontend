// React
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Provider
import { AuthProvider, useAuth } from './auth-provider'

// Types
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockIsTokenValid = vi.fn()
const mockGetStoredAuthSession = vi.fn()
const mockSetAuthSession = vi.fn()
const mockClearAuthSession = vi.fn()
const mockToastError = vi.fn()

vi.mock('#/shared/lib/auth-storage', () => ({
  getStoredAuthSession: () => mockGetStoredAuthSession(),
  setAuthSession: (...args: unknown[]) => mockSetAuthSession(...args),
  clearAuthSession: () => mockClearAuthSession(),
}))

vi.mock('#/shared/lib/auth-token', () => ({
  isTokenValid: (token: string | null) => mockIsTokenValid(token),
}))

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAuthProvider() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>,
  })
}

const validToken =
  'header.' +
  btoa(
    JSON.stringify({
      sub: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 1000000,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ) +
  '.signature'

const expiredToken =
  'header.' +
  btoa(
    JSON.stringify({
      sub: 'u1',
      companyId: 'c1',
      email: 'user@co.com',
      iat: 100,
      exp: 1,
    }),
  ) +
  '.signature'

const mockUser = {
  id: 'u1',
  email: 'user@co.com',
  name: 'User',
  companyId: 'c1',
}

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------
describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization (useEffect)', () => {
    it('should restore session when stored session is valid', () => {
      mockGetStoredAuthSession.mockReturnValue({
        accessToken: validToken,
        user: mockUser,
      })
      mockIsTokenValid.mockReturnValue(true)

      const { result } = renderAuthProvider()

      expect(result.current.isReady).toBe(true)
      expect(result.current.token).toBe(validToken)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should clear session when no stored session exists', () => {
      mockGetStoredAuthSession.mockReturnValue(null)

      const { result } = renderAuthProvider()

      expect(result.current.isReady).toBe(true)
      expect(result.current.token).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockClearAuthSession).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should store session and update state for valid token', () => {
      mockGetStoredAuthSession.mockReturnValue(null)
      mockIsTokenValid.mockReturnValue(true)

      const { result } = renderAuthProvider()

      act(() => {
        result.current.login({
          accessToken: validToken,
          user: mockUser,
        })
      })

      expect(mockSetAuthSession).toHaveBeenCalledWith({
        accessToken: validToken,
        user: mockUser,
      })
      expect(result.current.token).toBe(validToken)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should reject login when token is expired', () => {
      mockGetStoredAuthSession.mockReturnValue(null)
      mockIsTokenValid.mockReturnValue(false)

      const { result } = renderAuthProvider()

      act(() => {
        result.current.login({
          accessToken: expiredToken,
          user: mockUser,
        })
      })

      expect(mockClearAuthSession).toHaveBeenCalled()
      expect(result.current.token).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockToastError).toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should clear all auth state', () => {
      mockGetStoredAuthSession.mockReturnValue({
        accessToken: validToken,
        user: mockUser,
      })
      mockIsTokenValid.mockReturnValue(true)

      const { result } = renderAuthProvider()

      act(() => {
        result.current.logout()
      })

      expect(mockClearAuthSession).toHaveBeenCalled()
      expect(result.current.token).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// useAuth
// ---------------------------------------------------------------------------
describe('useAuth', () => {
  it('should throw when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')
  })
})
