// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

// Lib
import {
  formatDateTime,
  getVerdictLabelKey,
  getVerdictReasonNameKey,
  verdictTone,
} from '../lib/access.lib'

// Types
import type { AccessContextResponse } from '../types/access.types'

// Shared
import { cn } from '#/shared/lib/utils'

/** Tom do veredito → classes do bloco de veredito. */
const TONE_CLASSES = {
  success: 'border-primary/40 bg-primary/5',
  warning: 'border-amber-500/40 bg-amber-500/5',
  destructive: 'border-destructive/40 bg-destructive/5',
} as const

/** Tom do veredito → cor do ícone. */
const TONE_ICON_CLASSES = {
  success: 'text-primary',
  warning: 'text-amber-500',
  destructive: 'text-destructive',
} as const

/**
 * Resumo da placa (veículo + setor) — usado nas etapas que não são a ficha
 * completa (saída e impedimento), para o porteiro não perder de vista o que
 * está registrando. Aceita a ficha ainda não carregada (só a placa).
 */
export function AccessPlateSummary({
  plate,
  context,
}: {
  plate: string
  context: AccessContextResponse | null
}) {
  const { t } = useTranslation('access')

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="font-semibold uppercase">{plate}</span>
      {context?.vehicle ? (
        <>
          <span className="text-muted-foreground">
            {context.vehicle.model ?? t('verdict.vehicle.noModel')}
          </span>
          {context.department.name ? (
            <span className="text-muted-foreground">{context.department.name}</span>
          ) : null}
          {context.vehicle.freePass ? (
            <span className="text-primary text-xs font-medium">
              {t('verdict.vehicle.freePass')}
            </span>
          ) : null}
        </>
      ) : (
        <span className="text-muted-foreground">{t('verdict.vehicle.unregistered')}</span>
      )}
    </div>
  )
}

/**
 * Ficha da portaria com o **veredito** do servidor (ADR 0014 §2).
 *
 * O componente não recalcula regra nenhuma: exibe o veredito, os motivos que o
 * compõem e os dados que o porteiro confere no balcão (veículo, bloqueio,
 * setor com ocupação, condutores vinculados, situação da solicitação e entradas
 * abertas). Os motivos vêm em chips com o nome genérico (`reasonNames`) e o
 * rótulo principal usa o par veredito × motivo quando existe.
 */
export function AccessVerdictCard({ context }: { context: AccessContextResponse }) {
  const { t } = useTranslation('access')

  const tone = verdictTone(context.verdict)
  const VerdictIcon =
    tone === 'success' ? CheckCircle2 : tone === 'warning' ? AlertTriangle : XCircle

  const latestRequest = context.requests[0]

  return (
    <div className="space-y-4">
      {/* Veredito */}
      <div className={cn('rounded-lg border p-4', TONE_CLASSES[tone])}>
        <div className="flex items-start gap-3">
          <VerdictIcon className={cn('mt-0.5 size-5 shrink-0', TONE_ICON_CLASSES[tone])} />
          <div className="space-y-1">
            <p className="text-foreground font-semibold">
              {t(getVerdictLabelKey(context.verdict, context.reasons[0]))}
            </p>
            {context.reasons.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {context.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="bg-background/60 text-muted-foreground rounded px-1.5 py-0.5 text-xs"
                  >
                    {t(getVerdictReasonNameKey(reason))}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {/* Veículo */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="col-span-2 flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t('verdict.vehicle.label')}</dt>
          <dd className="flex items-center gap-2 text-right">
            {context.vehicle ? (
              <>
                <span className="font-semibold uppercase">{context.vehicle.plate}</span>
                <span className="text-muted-foreground">
                  {context.vehicle.model ?? t('verdict.vehicle.noModel')}
                </span>
                {context.vehicle.color ? (
                  <span className="text-muted-foreground">{context.vehicle.color}</span>
                ) : null}
                {context.vehicle.vehicleType ? (
                  <span className="text-muted-foreground">{context.vehicle.vehicleType.name}</span>
                ) : null}
                {context.vehicle.freePass ? (
                  <span className="text-primary text-xs font-medium">
                    {t('verdict.vehicle.freePass')}
                  </span>
                ) : null}
                {!context.vehicle.isActive ? (
                  <span className="text-destructive text-xs font-medium">
                    {t('verdict.vehicle.inactive')}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">{t('verdict.vehicle.unregistered')}</span>
            )}
          </dd>
        </div>

        {/* Setor + ocupação */}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t('verdict.department.label')}</dt>
          <dd className="text-right">
            {context.department.name ?? t('verdict.department.free')}
            {context.department.capacity > 0 ? (
              <span className="text-muted-foreground">
                {' · '}
                {t('verdict.department.places', {
                  occupied: context.department.occupied,
                  capacity: context.department.capacity,
                })}
              </span>
            ) : null}
          </dd>
        </div>

        {/* Condutores vinculados */}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t('verdict.drivers.label')}</dt>
          <dd className="text-right">
            {context.drivers.linked.length === 0 ? (
              <span className="text-muted-foreground">{t('verdict.drivers.empty')}</span>
            ) : (
              <ul className="flex flex-wrap justify-end gap-1.5">
                {context.drivers.linked.map((driver) => (
                  <li key={driver.id} className="flex items-center gap-1">
                    <span>{driver.name}</span>
                    {driver.isPrimary ? (
                      <span className="text-primary text-xs font-medium">
                        {t('verdict.drivers.primary')}
                      </span>
                    ) : null}
                    {!driver.canDrive ? (
                      <span className="text-xs font-medium text-amber-600">
                        {t('verdict.drivers.noPermission')}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      {/* Bloqueio ativo */}
      {context.block ? (
        <p className="border-destructive/40 bg-destructive/5 text-destructive rounded-md border p-2 text-xs">
          <span className="font-medium">{t('verdict.block.label')}:</span> {context.block.reason}
          {' · '}
          {t('verdict.block.since', { date: formatDateTime(context.block.blockedAt) })}
        </p>
      ) : null}

      {/* Solicitação da placa (a mais recente) */}
      {latestRequest ? (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">{t('verdict.requests.label')}:</span>{' '}
          {t(`verdict.requests.status.${latestRequest.status}`)}
          {' · '}
          {t('verdict.requests.days', { count: latestRequest.daysSinceRequest })}
          {latestRequest.entryAuthorized ? (
            <span className="text-primary"> · {t('verdict.requests.preAuthorized')}</span>
          ) : null}
          {latestRequest.isOverdue ? (
            <span className="text-destructive"> · {t('denial.reasons.OVERDUE')}</span>
          ) : null}
        </p>
      ) : null}

      {/* Já está dentro (reentrada) */}
      {context.openAccesses.length > 0 ? (
        <p className="text-xs text-amber-600">
          {t('verdict.open.label', {
            date: formatDateTime(context.openAccesses[0].entryAt),
          })}
          {context.openAccesses[0].driver.name ? ` · ${context.openAccesses[0].driver.name}` : null}
        </p>
      ) : null}
    </div>
  )
}
