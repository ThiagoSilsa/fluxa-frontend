// React
import { useEffect, useState } from 'react'

// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { usersService } from '../services/user.service'

/** Debounce da consulta de existência por e-mail (ADR 0005 §2.1). */
const DEBOUNCE_MS = 500

/** Validação leve de formato antes de consultar (evita chamadas à toa). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Hook que consulta se um e-mail já tem conta no sistema (modo "vincular").
 *
 * Debounce de 500ms + validação de formato + normalização (trim/lowercase)
 * antes de consultar `GET /users/email-status`. Cacheado por 1 minuto e sem
 * retry — a rota é throttled no backend.
 *
 * @param email E-mail digitado no formulário.
 * @param enabled Habilita a consulta (apenas no modo criação).
 * @returns `{ exists, isChecking }` — `exists=true` → formulário vira vincular.
 */
export function useEmailStatus(
  email: string,
  enabled = true,
): { exists: boolean; isChecking: boolean } {
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const trimmed = email.trim().toLowerCase()

    if (!enabled || !EMAIL_PATTERN.test(trimmed)) {
      setDebounced('')
      return
    }

    const timer = setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [email, enabled])

  const { data, isFetching } = useQuery({
    queryKey: ['user-email-status', debounced],
    queryFn: () => usersService.emailStatus(debounced),
    enabled: debounced.length > 0,
    staleTime: 60_000,
    retry: false,
  })

  return { exists: data?.exists ?? false, isChecking: isFetching }
}
