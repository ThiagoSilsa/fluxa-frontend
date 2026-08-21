// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { formatDateTime } from '../lib/access.lib'

// Types
import type { AccessExitResponse } from '../types/access.types'

// Shared
import { Card, CardContent, CardHeader, CardTitle } from '#/shared/components'

/**
 * Resultado do registro de saída.
 *
 * Mostra a saída sem entrada (`NO_EXIT` — regra 11) quando não havia INSIDE
 * aberto e/ou os acessos encerrados (`OUT`) com seus movimentos EXIT.
 */
export function ExitResult({ result }: { result: AccessExitResponse }) {
  const { t } = useTranslation('access')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('result.exit.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {result.noExit ? (
          <div className="rounded-md border p-3">
            <p className="font-medium">{t('result.exit.noExit')}</p>
            <p>
              {t('result.exit.plate')}: {result.noExit.movement.plateSnapshot}
            </p>
            <p>
              {t('result.exit.driver')}: {result.noExit.access.temporaryDriverName ?? '—'}
            </p>
            <p>
              {t('result.exit.exitAt')}: {formatDateTime(result.noExit.access.exitAt)}
            </p>
          </div>
        ) : null}

        {result.closedAccesses.length > 0 ? (
          <div className="space-y-2">
            <p className="font-medium">
              {t('result.exit.closed')} ({result.closedAccesses.length})
            </p>
            {result.closedAccesses.map(({ access, movement }) => (
              <div key={movement.id} className="rounded-md border p-3">
                <p>
                  {t('result.exit.plate')}: {movement.plateSnapshot}
                </p>
                <p>
                  {t('result.exit.driver')}:{' '}
                  {access.temporaryDriverName ?? access.driverUserId ?? '—'}
                </p>
                <p>
                  {t('result.exit.entryAt')}: {formatDateTime(access.entryAt)}
                </p>
                <p>
                  {t('result.exit.exitAt')}: {formatDateTime(access.exitAt)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
