// React
import { useMemo } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useOccupancyQuery } from '../hooks/use-occupancy-query'

// Lib
import { getOccupancyTone } from '../lib/access.lib'

// Types
import type { OccupancyDepartmentView } from '../types/access.types'

// Shared
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Header,
  PageLayout,
  PagePlaceholder,
  Skeleton,
} from '#/shared/components'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/** Cores da barra de progresso conforme o tom da ocupação. */
const TONE_CLASS: Record<string, string> = {
  safe: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

/**
 * Barra de progresso simples (sem dependência externa) com tom conforme a
 * ocupação (verde/âmbar/vermelho).
 */
function OccupancyBar({ rate }: { rate: number | null }) {
  const tone = getOccupancyTone(rate)
  const width = rate === null ? 0 : Math.min(rate, 100)

  return (
    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-all ${tone ? TONE_CLASS[tone] : 'bg-muted'}`}
        style={{ width: `${width}%` }}
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

/** Linha da tabela de ocupação por departamento. */
function DepartmentRow({ department }: { department: OccupancyDepartmentView }) {
  const { t } = useTranslation('access')

  return (
    <li className="space-y-1.5 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{department.name}</span>
        <span className="text-muted-foreground text-xs">
          {department.occupied} / {department.capacity}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <OccupancyBar rate={department.rate} />
        </div>
        <span className="text-muted-foreground w-10 text-right text-xs">
          {department.rate === null ? t('occupancy.noCapacity') : `${department.rate}%`}
        </span>
      </div>
    </li>
  )
}

/**
 * Página de ocupação em tempo real (ADR 0010 M5 — Fase 2).
 *
 * Painel com o total de veículos dentro, vagas livres e capacidade, mais a
 * ocupação por departamento — atualizado por polling a cada 3s. Acesso
 * restrito a `VIEW_DASHBOARDS`.
 */
export function OcupacaoPage() {
  const { t } = useTranslation('access')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canView = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.VIEW_DASHBOARDS] }),
    [user],
  )

  const { data, isPending, isError } = useOccupancyQuery()

  if (!canView) {
    return (
      <PageLayout>
        <PagePlaceholder title={tc('no-access.title')} />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Header title={t('occupancy.title')} subtitle={t('occupancy.subtitle')} />

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {isError && !data ? <p className="text-destructive text-sm">{t('occupancy.error')}</p> : null}

      {data ? (
        <>
          <p className="text-muted-foreground text-xs">{t('occupancy.refresh')}</p>

          {/* Cards de totais */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>{t('occupancy.cards.total.label')}</CardDescription>
                <CardTitle className="text-4xl">
                  {t('occupancy.cards.total.value', { count: data.totalOccupied })}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t('occupancy.cards.free.label')}</CardDescription>
                <CardTitle className="text-4xl">
                  {t('occupancy.cards.free.value', { count: data.freeSlots })}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t('occupancy.cards.capacity.label')}</CardDescription>
                <CardTitle className="text-4xl">
                  {t('occupancy.cards.capacity.value', { count: data.totalCapacity })}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Ocupação global */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('occupancy.totalRate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <OccupancyBar rate={data.totalRate} />
                </div>
                <span className="text-muted-foreground w-12 text-right text-sm">
                  {data.totalRate === null ? '—' : `${data.totalRate}%`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Por departamento */}
          <Card>
            <CardHeader>
              <CardTitle>{t('occupancy.byDepartment.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.byDepartment.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('occupancy.byDepartment.empty')}</p>
              ) : (
                <ul className="divide-y">
                  {data.byDepartment.map((department) => (
                    <DepartmentRow key={department.departmentId} department={department} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </PageLayout>
  )
}
