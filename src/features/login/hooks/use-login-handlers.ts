// React
import { useState } from 'react'

// Router
import { useNavigate } from '@tanstack/react-router'

// Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// i18n
import { useTranslation } from 'react-i18next'

// Toast
import { toast } from 'sonner'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// Services
import { authService } from '../services/auth.service'

// Lib
import { buildUserSession } from '#/shared/services/session.service'
import { parseTokenPayload } from '#/shared/lib/auth-token'
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

// Types
import type { AuthUser } from '#/shared/types/auth.types'
import type { LoginCompanyChoice, LoginResponse } from '../types/login.types'

// Schemas
import type { LoginSchema } from '../schemas/auth.schema'

// Feature
import { isLoginSession } from '../types/login.types'

/**
 * Lógica de submit do login.
 *
 * Concentra a chamada à API, a decisão entre sessão e escolha de empresa, a
 * construção da sessão completa e a navegação pós-login.
 *
 * A credencial pendente (multi-empresa) fica SÓ em memória: o backend pede
 * e-mail e senha de novo junto da empresa escolhida. Em `sessionStorage` ela
 * sobreviveria a um reload, virando credencial guardada em disco para quem
 * nem entrou.
 */
export function useLoginHandlers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const auth = useAuth()
  const { t } = useTranslation('login')
  const { t: tc } = useTranslation('common')

  const [companies, setCompanies] = useState<LoginCompanyChoice[] | null>(null)
  const [pendingCredentials, setPendingCredentials] = useState<LoginSchema | null>(null)

  const mutation = useMutation({
    mutationFn: (values: LoginSchema & { companyId?: string }) => authService.login(values),

    onSuccess: async (data: LoginResponse, values) => {
      // Desfecho 1: a senha vale para mais de uma empresa -> pedir escolha.
      if (!isLoginSession(data)) {
        setPendingCredentials({ email: values.email, password: values.password })
        setCompanies(data.companies)
        return
      }

      try {
        // A empresa da sessão vem do payload do JWT (o login não a devolve).
        const tokenPayload = parseTokenPayload(data.accessToken)
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          companyId: tokenPayload?.companyId ?? '',
          type: data.user.type,
        }
        const baseSession = { accessToken: data.accessToken, user }

        // Sessão básica para atualizar o estado imediatamente.
        auth.login(baseSession)

        // Sessão completa: cargos e permissões via /auth/validate.
        const session = await buildUserSession(baseSession)
        auth.login(session)

        // Zera o cache do React Query antes de navegar: nada da sessão
        // anterior permanece na tela.
        await queryClient.invalidateQueries()

        setPendingCredentials(null)
        setCompanies(null)

        await navigate({ to: '/home' })
      } catch (error) {
        toast.error(t('form.errors.post-login-setup'))
      }
    },

    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  const handleSubmit = async (values: LoginSchema) => {
    await mutation.mutateAsync(values)
  }

  // Entra na empresa escolhida: reenvia a credencial + companyId.
  const chooseCompany = async (companyId: string) => {
    if (!pendingCredentials) return
    await mutation.mutateAsync({ ...pendingCredentials, companyId })
  }

  // Volta da escolha: descarta a credencial pendente e limpa o erro.
  const cancelCompanyChoice = () => {
    setPendingCredentials(null)
    setCompanies(null)
    mutation.reset()
  }

  return {
    handleSubmit,
    isSubmitting: mutation.isPending,
    authError: mutation.error ? tc(getAPIErrorTranslationKey(mutation.error)) : null,
    clearAuthError: () => mutation.reset(),
    companies,
    chooseCompany,
    cancelCompanyChoice,
  }
}
