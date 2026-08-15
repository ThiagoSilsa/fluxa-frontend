// Icons
import { IoIosReturnLeft } from 'react-icons/io'

// i18n
import { useTranslation } from 'react-i18next'

// Router
import { useNavigate } from '@tanstack/react-router'

// Components
import { Button } from '#/shared/components/ui/button'

interface ReturnButtonProps {
  path?: string
}

/**
 * Botão de voltar — navega para `path` quando informado, senão volta no
 * histórico do navegador.
 */
export function ReturnButton({ path }: ReturnButtonProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (path) {
            navigate({ to: path })
          } else {
            window.history.back()
          }
        }}
        title={t('detail.back')}
      >
        <IoIosReturnLeft />
        <p>{t('detail.back')}</p>
      </Button>
    </div>
  )
}
