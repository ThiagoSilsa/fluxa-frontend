// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { IoLockClosedOutline } from 'react-icons/io5'

/**
 * Tela de "sem acesso" exibida quando o usuário autenticado não tem a
 * permissão/cargo exigido por uma rota protegida.
 */
export function AuthBlock() {
  const { t } = useTranslation('common')

  return (
    <div className="m-auto flex h-full items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <IoLockClosedOutline size={30} />
        <h1 className="text-2xl font-semibold">{t('no-access.title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('no-access.description')}</p>
      </div>
    </div>
  )
}
