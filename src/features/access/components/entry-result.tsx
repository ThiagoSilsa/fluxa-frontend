// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { formatDateTime, getEntryDenialReasonKey } from '../lib/access.lib'

// Types
import type { AccessEntryResponse } from '../types/access.types'

// Shared
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/shared/components'

/**
 * Resultado do registro de entrada.
 *
 * `granted: true` mostra a liberação (placa, condutor, horário e reentrada,
 * se houver); `granted: false` mostra o impedimento registrado
 * automaticamente (motivo + observação — ADR 0010 §3).
 */
export function EntryResult({ result }: { result: AccessEntryResponse }) {
  const { t } = useTranslation('access')

  if (result.granted) {
    return (
      <Card className="border-emerald-500/50">
        <CardHeader>
          <CardTitle className="text-emerald-600">{t('result.entry.granted.title')}</CardTitle>
          <CardDescription>{t('result.entry.granted.message')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="font-medium">{t('result.entry.plate')}: </span>
            {result.movement?.plateSnapshot ?? '—'}
          </p>
          <p>
            <span className="font-medium">{t('result.entry.driver')}: </span>
            {result.access?.temporaryDriverName ?? result.access?.driverUserId ?? '—'}
          </p>
          <p>
            <span className="font-medium">{t('result.entry.entryAt')}: </span>
            {formatDateTime(result.access?.entryAt)}
          </p>
          {result.previousClosed ? (
            <p>
              <span className="font-medium">{t('result.entry.previousClosed')}: </span>
              {formatDateTime(result.previousClosed.access.exitAt)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{t('result.entry.denied.title')}</CardTitle>
        <CardDescription>{t('result.entry.denied.message')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="font-medium">{t('denial.title')}: </span>
          {result.denial ? t(getEntryDenialReasonKey(result.denial.reason)) : '—'}
        </p>
        {result.denial?.observation ? (
          <p>
            <span className="font-medium">{t('denial.observation')}: </span>
            {result.denial.observation}
          </p>
        ) : null}
        <p>
          <span className="font-medium">{t('denial.plate')}: </span>
          {result.denial?.plateSnapshot ?? '—'}
        </p>
      </CardContent>
    </Card>
  )
}
