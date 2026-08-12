// UI
import { PublicPageShell } from '#/shared/components/public-page-shell'

// Feature
import { LoginCard } from '../components/login-card'

/**
 * Página de login (rota pública `/`).
 */
export function LoginPage() {
  return (
    <PublicPageShell>
      <LoginCard />
    </PublicPageShell>
  )
}
