// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Components
import { Badge } from '#/shared/components'

// Lib
import { formatDateTime, getDenialReasonLabelKey } from '../lib/access.lib'

// Types
import type { AccessRecord } from '../types/access.types'

const columnHelper = createColumnHelper<AccessRecord>()

/** Tom do badge por tipo de registro (entrada/saída/impedimento). */
const KIND_BADGE_CLASSES: Record<AccessRecord['kind'], string> = {
  ENTRY: 'bg-primary/10 text-primary border-primary',
  EXIT: 'bg-muted text-muted-foreground',
  DENIAL: 'bg-destructive/10 text-destructive border-destructive',
}

/**
 * Colunas do feed da portaria (ADR 0015).
 *
 * O servidor já entrega ordenado (`occurredAt DESC`) e não aceita `sortBy` —
 * nenhuma coluna é ordenável. O motivo só existe em impedimento; nas demais
 * linhas fica o traço.
 *
 * @param params Dependências de renderização (i18n da feature).
 * @returns Colunas da `GenericTable`.
 */
export function createAccessRecordColumns({ t }: { t: (key: string) => string }) {
  return [
    columnHelper.accessor('kind', {
      header: t('records.columns.kind'),
      enableSorting: false,
      size: 120,
      cell: ({ getValue }) => {
        const kind = getValue()
        return (
          <Badge className={`shrink-0 px-2 text-xs ${KIND_BADGE_CLASSES[kind]}`} variant="outline">
            {t(`records.kind.${kind}`)}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('plate', {
      header: t('records.columns.plate'),
      enableSorting: false,
      size: 120,
      cell: ({ getValue }) => <span className="font-medium uppercase">{getValue()}</span>,
    }),
    columnHelper.accessor('driverName', {
      header: t('records.columns.driver'),
      enableSorting: false,
      size: 180,
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor((row) => row.vehicleModel ?? row.departmentName, {
      id: 'vehicle',
      header: t('records.columns.vehicle'),
      enableSorting: false,
      cell: ({ row }) => {
        const { vehicleModel, departmentName } = row.original
        if (!vehicleModel && !departmentName) {
          return '—'
        }
        return (
          <>
            {vehicleModel ? <span>{vehicleModel}</span> : null}
            {vehicleModel && departmentName ? (
              <span className="text-muted-foreground"> · </span>
            ) : null}
            {departmentName ? (
              <span className="text-muted-foreground">{departmentName}</span>
            ) : null}
          </>
        )
      },
    }),
    columnHelper.accessor('entranceName', {
      header: t('records.columns.entrance'),
      enableSorting: false,
      size: 140,
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('doormanName', {
      header: t('records.columns.doorman'),
      enableSorting: false,
      size: 160,
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('reason', {
      header: t('records.columns.reason'),
      enableSorting: false,
      size: 180,
      cell: ({ getValue }) => {
        const reason = getValue()
        return reason ? t(getDenialReasonLabelKey(reason)) : '—'
      },
    }),
    columnHelper.accessor('occurredAt', {
      header: t('records.columns.occurredAt'),
      enableSorting: false,
      size: 160,
      cell: ({ getValue }) => formatDateTime(getValue()),
    }),
  ]
}
