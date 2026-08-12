// UI
import { PublicPageShell } from '#/shared/components/public-page-shell'
import { ThemeProvider } from 'next-themes'

// Feature
import { LoginCard } from '../components/login-card'
import ThemeToggle from '#/shared/components/ThemeToggle'
import { LanguageSelector } from '#/shared/components/language-selector'

/**
 * Página de login (rota pública `/`).
 */
export function LoginPage() {
  return (
    <PublicPageShell>
      <ThemeToggle />
      <LanguageSelector/>
      <LoginCard />
    </PublicPageShell>
  )
}
