import type { ReactNode } from 'react'

export type PageLayoutProps = {
  children: ReactNode
  className?: string
}

/**
 * Layout padrão de página.
 * Aplica o container responsivo com padding e flex column.
 *
 * @example
 * ```tsx
 * <PageLayout>
 *   <Header title="..." />
 *   ...
 * </PageLayout>
 * ```
 */
export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div
      className={`flex min-h-screen w-full flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10 ${className}`}
    >
      {children}
    </div>
  )
}
