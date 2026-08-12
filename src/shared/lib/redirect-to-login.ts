import { clearAuthSession } from './auth-storage'

/**
 * Redireciona para a página de login se ainda não estiver nela.
 * Limpa a sessão de autenticação antes de redirecionar.
 */
export function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    clearAuthSession()
    window.location.href = '/'
  }
}
