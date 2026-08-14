// React
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Hook
import { useLoginHandlers } from './use-login-handlers'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn()
const mockInvalidateQueries = vi.fn()
const mockLogin = vi.fn()
const mockToastError = vi.fn()
const mockAuthServiceLogin = vi.fn()
const mockBuildUserSession = vi.fn()
const mockParseTokenPayload = vi.fn()

let mutationOptions: {
  mutationFn: (values: unknown) => Promise<unknown>
  onSuccess?: (data: unknown, variables: unknown) => void | Promise<void>
  onError?: (error: unknown) => void
} = { mutationFn: async () => undefined }

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useMutation: (options: typeof mutationOptions) => {
    mutationOptions = options
    return {
      mutateAsync: async (values: unknown) => {
        try {
          const data = await mutationOptions.mutationFn(values)
          await mutationOptions.onSuccess?.(data, values)
          return data
        } catch (error) {
          mutationOptions.onError?.(error)
          throw error
        }
      },
      isPending: false,
      error: null,
      reset: vi.fn(),
    }
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}))

vi.mock('#/app/providers/auth-provider', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('../services/auth.service', () => ({
  authService: { login: (...args: unknown[]) => mockAuthServiceLogin(...args) },
}))

vi.mock('#/shared/services/session.service', () => ({
  buildUserSession: (...args: unknown[]) => mockBuildUserSession(...args),
}))

vi.mock('#/shared/lib/auth-token', () => ({
  parseTokenPayload: (...args: unknown[]) => mockParseTokenPayload(...args),
}))

vi.mock('#/shared/lib/api-error', () => ({
  getAPIErrorTranslationKey: (error: unknown) =>
    (error as { key?: string })?.key ?? 'errors.generic',
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const credentials = { email: 'user@co.com', password: '123' }

const sessionResponse = {
  accessToken: 'token',
  tokenType: 'Bearer',
  expiresIn: 28800,
  user: { id: 'u1', name: 'User', email: 'user@co.com', type: 'EMPLOYEE' },
}

const tokenPayload = {
  sub: 'u1',
  companyId: 'c1',
  email: 'user@co.com',
  iat: 100,
  exp: 9999999999,
}

const enrichedSession = {
  accessToken: 'token',
  user: {
    id: 'u1',
    name: 'User',
    email: 'user@co.com',
    companyId: 'c1',
    roleCodes: ['Administração'],
    permissionCodes: ['MANAGE_COMPANY'],
    type: 'EMPLOYEE',
  },
}

const companyChoiceResponse = {
  requiresCompanyChoice: true,
  companies: [
    { id: 'c1', name: 'SOMAR' },
    { id: 'c2', name: 'Autarquia B' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useLoginHandlers', () => {
  it('desfecho de sessão: atualiza o auth, invalida o cache e navega para /home', async () => {
    mockAuthServiceLogin.mockResolvedValue(sessionResponse)
    mockParseTokenPayload.mockReturnValue(tokenPayload)
    mockBuildUserSession.mockResolvedValue(enrichedSession)

    const { result } = renderHook(() => useLoginHandlers())

    await act(async () => {
      await result.current.handleSubmit(credentials)
    })

    expect(mockLogin).toHaveBeenCalledTimes(2)
    expect(mockLogin).toHaveBeenNthCalledWith(1, {
      accessToken: 'token',
      user: { id: 'u1', name: 'User', email: 'user@co.com', companyId: 'c1', type: 'EMPLOYEE' },
    })
    expect(mockLogin).toHaveBeenNthCalledWith(2, enrichedSession)
    expect(mockInvalidateQueries).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
    expect(result.current.companies).toBeNull()
  })

  it('desfecho de escolha de empresa: guarda a credencial pendente e não navega', async () => {
    mockAuthServiceLogin.mockResolvedValue(companyChoiceResponse)

    const { result } = renderHook(() => useLoginHandlers())

    await act(async () => {
      await result.current.handleSubmit(credentials)
    })

    expect(result.current.companies).toEqual(companyChoiceResponse.companies)
    expect(mockLogin).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('chooseCompany reenvia a credencial junto da empresa escolhida', async () => {
    mockAuthServiceLogin
      .mockResolvedValueOnce(companyChoiceResponse)
      .mockResolvedValue(sessionResponse)
    mockParseTokenPayload.mockReturnValue(tokenPayload)
    mockBuildUserSession.mockResolvedValue(enrichedSession)

    const { result } = renderHook(() => useLoginHandlers())

    await act(async () => {
      await result.current.handleSubmit(credentials)
    })
    await act(async () => {
      await result.current.chooseCompany('c1')
    })

    expect(mockAuthServiceLogin).toHaveBeenLastCalledWith({
      email: 'user@co.com',
      password: '123',
      companyId: 'c1',
    })
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
  })

  it('cancelCompanyChoice descarta a credencial pendente e a escolha', async () => {
    mockAuthServiceLogin.mockResolvedValue(companyChoiceResponse)

    const { result } = renderHook(() => useLoginHandlers())

    await act(async () => {
      await result.current.handleSubmit(credentials)
    })
    expect(result.current.companies).not.toBeNull()

    act(() => {
      result.current.cancelCompanyChoice()
    })

    expect(result.current.companies).toBeNull()
  })

  it('erro de login mostra o toast com a chave traduzida', async () => {
    mockAuthServiceLogin.mockRejectedValue({ key: 'errors.invalidCredentials' })

    const { result } = renderHook(() => useLoginHandlers())

    await act(async () => {
      await result.current.handleSubmit(credentials)
    })

    expect(mockToastError).toHaveBeenCalledWith('errors.invalidCredentials')
  })
})
