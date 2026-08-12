// UI
import { PublicPageShell } from '#/shared/components/public-page-shell'
import { ThemeProvider } from 'next-themes'

// Feature
import { LoginCard } from '../components/login-card'
import ThemeToggle from '#/shared/components/ThemeToggle'
import { LanguageSelector } from '#/shared/components/language-selector'

import { useTranslation } from 'react-i18next'

/**
 * Página de login (rota pública `/`).
 */
export function LoginPage() {
  const { t } = useTranslation('login')
  return (
    <PublicPageShell>
      <div className="flex h-full w-full">
        {/* Área visual */}
        <div className="relative hidden w-1/2 overflow-hidden bg-[url('/images/login-background.jpg')] bg-cover bg-center lg:flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <h1 className="text-4xl font-bold">{t('banner.logo')}</h1>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/70">{t('banner.title')}</p>
              <p className="text-xl text-white">{t('banner.description')}</p>
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="flex w-full flex-col items-center justify-center lg:w-1/2">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <ThemeProvider attribute="class" defaultTheme="light">
              <ThemeToggle />
            </ThemeProvider>
            <LanguageSelector />
          </div>
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <h1 className="text-foreground text-3xl font-bold">{t('login.welcome')}</h1>
            <p className="text-muted-foreground text-md">{t('login.description')}</p>
          </div>
          <LoginCard />
        </div>
      </div>
    </PublicPageShell>
  )
}
