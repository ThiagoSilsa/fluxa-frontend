// Router
import { HeadContent, Scripts } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { toLocaleTag } from '#/shared/lib/language.lib'

// Providers
import AppThemeProvider from '#/app/providers/theme-provider'
import { AuthProvider } from '#/app/providers/auth-provider'
import { LanguageProvider } from '#/app/providers/language-provider'

// Toaster
import { Toaster } from '#/shared/components/ui/sonner'
import { TooltipProvider } from '#/shared/components/ui/tooltip'

// Interfaces
interface RootDocumentProps {
  children: React.ReactNode
}

/**
 * Documento base da aplicação.
 *
 * O idioma anunciado (`lang`) acompanha o idioma em uso, e não um valor fixo: é
 * o que faz leitores de tela e tradutores do navegador tratarem a tela no
 * idioma certo. Vem do i18n (e não do provedor de idioma) porque o documento é
 * o pai dele; a troca no seletor re-renderiza os dois.
 *
 * `suppressHydrationWarning` no elemento raiz cobre a diferença entre o idioma
 * resolvido no servidor e o detectado no navegador.
 */
export function RootDocument({ children }: RootDocumentProps) {
  const { i18n } = useTranslation()

  return (
    <html lang={toLocaleTag(i18n.language)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </AppThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
