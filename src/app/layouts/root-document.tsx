import { HeadContent, Scripts } from '@tanstack/react-router'

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

export function RootDocument({ children }: RootDocumentProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
