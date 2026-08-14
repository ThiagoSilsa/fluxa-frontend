import { QueryClient } from '@tanstack/react-query'

/**
 * Retorna o contexto da aplicação, incluindo o cliente do React Query.
 * @returns {Object} O contexto da aplicação.
 */
export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
