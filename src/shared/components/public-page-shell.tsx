// Types
import type { ReactNode } from 'react'

interface PublicPageShellProps {
  children: ReactNode
}

/**
 * Moldura das telas públicas (login, recuperação de senha, etc.).
 *
 * Centraliza o conteúdo e aplica o fundo padrão. Reutilizável por qualquer
 * rota pública futura.
 */
export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <main className="bg-background flex h-dvh min-h-full w-dvw flex-col items-center justify-center gap-6">
      {children}
    </main>
  )
}
