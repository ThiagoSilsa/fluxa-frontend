// i18n
import { useTranslation } from 'react-i18next'

interface PagePlaceholderProps {
  /** Título da página (chave i18n já traduzida pelo chamador). */
  title: string
}

/**
 * Página provisória exibida enquanto a tela real do módulo não existe.
 *
 * TODO: Substituir pela página real de cada módulo.
 */
export function PagePlaceholder({ title }: PagePlaceholderProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex flex-col gap-2 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{t('placeholder.description')}</p>
    </div>
  )
}
