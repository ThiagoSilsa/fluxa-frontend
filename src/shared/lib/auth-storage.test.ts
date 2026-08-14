import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  setAuthSession,
  getAuthToken,
  getAuthUser,
  getStoredAuthSession,
  clearAuthSession,
  isAuthenticated,
} from './auth-storage'
import type { AuthSession, AuthUser } from '../types/auth.types'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockIsTokenValid = vi.hoisted(() => vi.fn())

vi.mock('#/shared/lib/auth-token', () => ({
  isTokenValid: mockIsTokenValid,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockUser: AuthUser = {
  id: 'user-1',
  email: 'user@company.com',
  name: 'John Doe',
  companyId: 'company-1',
  roleCodes: ['ADMIN'],
  permissionCodes: ['MANAGE_UNITS', 'VIEW_REPORTS'],
}

const mockSession: AuthSession = {
  accessToken:
    'header.eyJzdWIiOiJ1MSIsImNvbXBhbnlJZCI6ImMxIiwiZW1haWwiOiJ1QGMuY29tIiwiaWF0IjoxMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.signature',
  user: mockUser,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('setAuthSession', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should store accessToken and user in sessionStorage', () => {
    setAuthSession(mockSession)

    expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe(mockSession.accessToken)
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toBe(JSON.stringify(mockUser))
  })

  it('should overwrite any previous session data', () => {
    setAuthSession(mockSession)

    const newUser: AuthUser = { ...mockUser, id: 'user-2', name: 'Jane Doe' }
    const newSession: AuthSession = { accessToken: 'new-token', user: newUser }

    setAuthSession(newSession)

    expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token')
    expect(getAuthUser()?.name).toBe('Jane Doe')
  })
})

// ---------------------------------------------------------------------------
describe('getAuthToken', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should return null when no token is stored', () => {
    expect(getAuthToken()).toBeNull()
  })

  it('should return the stored token', () => {
    setAuthSession(mockSession)
    expect(getAuthToken()).toBe(mockSession.accessToken)
  })
})

// ---------------------------------------------------------------------------
describe('getAuthUser', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should return null when no user is stored', () => {
    expect(getAuthUser()).toBeNull()
  })

  it('should retrieve a previously stored user', () => {
    setAuthSession(mockSession)
    expect(getAuthUser()).toEqual(mockUser)
  })

  it('should return null when stored value is invalid JSON', () => {
    sessionStorage.setItem(AUTH_USER_KEY, 'not-valid-json')
    expect(getAuthUser()).toBeNull()
  })

  it('should return null when stored value is empty string', () => {
    sessionStorage.setItem(AUTH_USER_KEY, '')
    expect(getAuthUser()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
describe('getStoredAuthSession', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should return null when no token is stored', () => {
    expect(getStoredAuthSession()).toBeNull()
  })

  it('should return null when token is invalid', () => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, 'invalid-token')
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser))
    mockIsTokenValid.mockReturnValue(false)

    expect(getStoredAuthSession()).toBeNull()
  })

  it('should return null when token is valid but no user is stored', () => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, 'valid-token')
    mockIsTokenValid.mockReturnValue(true)

    expect(getStoredAuthSession()).toBeNull()
  })

  it('should return the full session when token is valid and user exists', () => {
    setAuthSession(mockSession)
    mockIsTokenValid.mockReturnValue(true)

    const result = getStoredAuthSession()
    expect(result).toEqual(mockSession)
  })

  it('should call isTokenValid with the stored token', () => {
    setAuthSession(mockSession)
    mockIsTokenValid.mockReturnValue(true)

    getStoredAuthSession()
    expect(mockIsTokenValid).toHaveBeenCalledWith(mockSession.accessToken)
  })
})

// ---------------------------------------------------------------------------
describe('clearAuthSession', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should remove token and user from sessionStorage', () => {
    setAuthSession(mockSession)
    expect(getAuthToken()).toBe(mockSession.accessToken)
    expect(getAuthUser()).toEqual(mockUser)

    clearAuthSession()

    expect(getAuthToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
  })

  it('should not throw when clearing with no session stored', () => {
    expect(() => clearAuthSession()).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
describe('isAuthenticated', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should return false when no session is stored', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('should return false when token is invalid', () => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, 'invalid-token')
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser))
    mockIsTokenValid.mockReturnValue(false)

    expect(isAuthenticated()).toBe(false)
  })

  it('should return true when a valid session is stored', () => {
    setAuthSession(mockSession)
    mockIsTokenValid.mockReturnValue(true)

    expect(isAuthenticated()).toBe(true)
  })
})
