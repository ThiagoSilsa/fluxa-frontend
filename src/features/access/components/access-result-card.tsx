// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

// Lib
import { formatDateTime, getDenialReasonLabelKey } from '../lib/access.lib'

// Types
import type {
  AccessEntryResponse,
  AccessExitResponse,
  ClosedAccessResponse,
  RegisterDenialResponse,
} from '../types/access.types'

// Shared
import { Button, Card, CardContent, CardHeader, CardTitle } from '#/shared/components'

export type AccessResultCardProps = {
  /** Resultado da entrada (`granted` decide o tom). */
  entry?: AccessEntryResponse | null
  /** Resultado da saída (acessos encerrados ou NO_EXIT). */
  exit?: AccessExitResponse | null
  /** Resultado do impedimento (+ pedido de bloqueio). */
  denial?: RegisterDenialResponse | null
  /** Setor confirmado na entrada (a resposta da entrada só traz o id). */
  departmentName?: string | null
  /** Volta ao passo da placa, limpando a ficha. */
  onRegisterAnother: () => void
  /** Fecha o modal. */
  onClose: () => void
}

/**
 * Resultado inline do registro feito no modal (entrada, saída ou impedimento).
 *
 * Nada de navegação: o porteiro vê o desfecho no mesmo lugar e escolhe entre
 * "Registrar outro" (volta à placa) e "Fechar". Os detalhes vêm da própria
 * resposta (o backend já devolve a ficha de quem entrou/saiu).
 */
export function AccessResultCard({
  entry,
  exit,
  denial,
  departmentName,
  onRegisterAnother,
  onClose,
}: AccessResultCardProps) {
  const { t } = useTranslation('access')

  if (denial) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-5" />
            {t('register.result.denial.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ResultRow label={t('register.result.plate')} value={denial.plateSnapshot} />
          <ResultRow
            label={t('register.result.reason')}
            value={t(getDenialReasonLabelKey(denial.reason))}
          />
          <ResultRow label={t('denial.observation')} value={denial.observation ?? '—'} />
          <p className="text-muted-foreground text-xs">
            {formatDateTime(denial.occurredAt)}
            {denial.blockRequest ? ` · ${t('register.result.blockRequest')}` : null}
          </p>
          {denial.blockRequestError ? (
            <p className="text-xs text-amber-600">{denial.blockRequestError}</p>
          ) : null}
          <ResultActions onRegisterAnother={onRegisterAnother} onClose={onClose} />
        </CardContent>
      </Card>
    )
  }

  if (exit) {
    const record: ClosedAccessResponse | null = exit.closedAccesses[0] ?? exit.noExit
    const isNoExit = exit.closedAccesses.length === 0 && !!exit.noExit

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-primary size-5" />
            {isNoExit ? t('register.result.exit.none') : t('register.result.exit.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isNoExit ? (
            <p className="text-muted-foreground text-xs">{t('register.exit.noExit')}</p>
          ) : null}
          <ResultRow
            label={t('register.result.plate')}
            value={record?.movement.plateSnapshot ?? '—'}
          />
          <ResultRow
            label={t('register.result.driver')}
            value={record?.driver?.name ?? record?.access.temporaryDriverName ?? '—'}
          />
          <ResultRow
            label={t('register.result.department')}
            value={record?.departmentName ?? '—'}
          />
          <ResultRow
            label={t('register.result.entryAt')}
            value={formatDateTime(record?.access.entryAt ?? null)}
          />
          <ResultRow
            label={t('register.result.exitAt')}
            value={formatDateTime(record?.movement.occurredAt ?? null)}
          />
          <ResultActions onRegisterAnother={onRegisterAnother} onClose={onClose} />
        </CardContent>
      </Card>
    )
  }

  if (entry) {
    const granted = entry.granted
    const previousClosed = entry.previousClosed ?? null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {granted ? (
              <CheckCircle2 className="text-primary size-5" />
            ) : (
              <AlertTriangle className="text-destructive size-5" />
            )}
            {granted ? t('register.result.entry.granted') : t('register.result.entry.denied')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground text-xs">{entry.message}</p>
          <ResultRow
            label={t('register.result.plate')}
            value={entry.movement?.plateSnapshot ?? entry.access?.temporaryPlate ?? '—'}
          />
          <ResultRow
            label={t('register.result.driver')}
            value={entry.access?.temporaryDriverName ?? '—'}
          />
          <ResultRow label={t('register.result.department')} value={departmentName ?? '—'} />
          <ResultRow
            label={t('register.result.entryAt')}
            value={formatDateTime(entry.movement?.occurredAt ?? entry.access?.entryAt ?? null)}
          />
          {entry.denial ? (
            <ResultRow
              label={t('register.result.reason')}
              value={t(getDenialReasonLabelKey(entry.denial.reason))}
            />
          ) : null}
          {previousClosed ? (
            <ResultRow
              label={t('register.result.previousClosed')}
              value={`${previousClosed.vehicle?.plate ?? previousClosed.movement.plateSnapshot}${
                previousClosed.driver?.name ? ` · ${previousClosed.driver.name}` : ''
              }`}
            />
          ) : null}
          <ResultActions onRegisterAnother={onRegisterAnother} onClose={onClose} />
        </CardContent>
      </Card>
    )
  }

  return null
}

/**
 * Ações do resultado: registrar outro (volta à placa) e fechar.
 */
function ResultActions({
  onRegisterAnother,
  onClose,
}: {
  onRegisterAnother: () => void
  onClose: () => void
}) {
  const { t } = useTranslation('access')

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button type="button" onClick={onRegisterAnother}>
        {t('register.actions.another')}
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>
        {t('register.actions.close')}
      </Button>
    </div>
  )
}

/**
 * Linha rótulo/valor do resultado.
 */
function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
