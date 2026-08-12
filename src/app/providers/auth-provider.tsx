'use client'

// React
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Type
import type { ReactNode } from 'react'
import type { AuthContextValue, AuthSession, AuthUser } from '#/shared/types/auth.types'

// Lib
import { clearAuthSession, getStoredAuthSession, setAuthSession } from '#/shared/lib/auth-storage'
import { isTokenValid } from '#/shared/lib/auth-token'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { t } = useTranslation('common')

  useEffect(() => {
    // Recebe dados da sessão já validados, ou null se não houver sessão válida
    const storedSession = getStoredAuthSession()

    if (storedSession) {
      setToken(storedSession.accessToken)
      setUser(storedSession.user)
      // TODO: Reconectar o WebSocket de presença (connectSocket) quando a feature de presença for implementada.
    } else {
      clearAuthSession()
      setToken(null)
      setUser(null)
    }

    // Garantir que o estado de autenticação seja atualizado antes de renderizar os filhos
    setIsReady(true)
  }, [])

  const login = (session: AuthSession) => {
    if (!isTokenValid(session.accessToken)) {
      clearAuthSession()
      setToken(null)
      setUser(null)
      toast.error(t('errors.invalid-token'))
      return
    }
    setAuthSession(session)
    setToken(session.accessToken)
    setUser(session.user)
    // TODO: Reconectar o WebSocket de presença (connectSocket) quando a feature de presença for implementada.
    // TODO: Limpar o cache de mídia da sessão anterior quando a feature de inbox for implementada.
  }

  const logout = () => {
    // TODO: Desconectar o WebSocket de presença (disconnectSocket) quando a feature de presença for implementada.
    clearAuthSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isReady,
      login,
      logout,
    }),
    [token, user, isReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
