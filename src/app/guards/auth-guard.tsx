'use client'

// React
import { Navigate } from '@tanstack/react-router'

// Types
import type { ReactNode } from 'react'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/**
 * Componente de guarda para rotas autenticadas. Redireciona para a página de login se o usuário não estiver autenticado.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
