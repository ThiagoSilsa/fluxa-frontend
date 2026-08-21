// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Icons
import { Pencil, Trash2 } from 'lucide-react'

// Types
import type { DeviceDeleteTarget, DeviceEntity } from '../types/devices.types'

// Components
import { Badge, Button } from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

const columnHelper = createColumnHelper<DeviceEntity>()

/** Formata uma data ISO para exibição local (data + hora curta). */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

/**
 * Colunas da tabela de dispositivos.
 *
 * Ordenáveis (server-side — whitelist do backend): nome, status e data de
 * criação. As demais são apenas exibição.
 *
 * @param params Dependências de renderização (i18n + callbacks de ação).
 * @returns Colunas da `GenericTable`.
 */
export function createDeviceColumns({
  t,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string
  onEdit: (device: DeviceEntity) => void
  onDelete: (target: DeviceDeleteTarget) => void
}) {
  return [
    columnHelper.accessor('name', {
      header: t('columns.name'),
      enableSorting: true,
      size: 220,
    }),
    columnHelper.accessor('platform', {
      header: t('columns.platform'),
      size: 110,
      cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
    }),
    columnHelper.accessor((row) => row.entrance?.name ?? '—', {
      id: 'entrance',
      header: t('columns.entrance'),
      cell: ({ row }) => row.original.entrance?.name ?? '—',
    }),
    columnHelper.accessor('appVersion', {
      header: t('columns.appVersion'),
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('lastSyncAt', {
      header: t('columns.lastSyncAt'),
      enableSorting: true,
      size: 170,
      cell: ({ getValue }) => (getValue() ? formatDateTime(getValue() as string) : '—'),
    }),
    columnHelper.accessor('isActive', {
      header: t('columns.status'),
      enableSorting: true,
      size: 110,
      cell: ({ getValue }) => {
        const active = getValue()
        return (
          <Badge
            className={cn(
              'shrink-0 px-2 text-xs',
              active
                ? 'bg-primary/10 text-primary border-primary'
                : 'bg-muted text-muted-foreground',
            )}
            variant="outline"
          >
            {active ? t('status.active') : t('status.inactive')}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: t('columns.createdAt'),
      enableSorting: true,
      size: 170,
      cell: ({ getValue }) => formatDateTime(getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      size: 90,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
            aria-label={t('toolbar.edit')}
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/10 hover:text-destructive size-8"
            onClick={(event) => {
              event.stopPropagation()
              onDelete({ id: row.original.id, name: row.original.name })
            }}
            aria-label={t('toolbar.delete')}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    }),
  ]
}
