// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Icons
import { Pencil, Trash2 } from 'lucide-react'

// Types
import type { VehicleEntity } from '../types/vehicles.types'

// Components
import { Badge, Button } from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

const columnHelper = createColumnHelper<VehicleEntity>()

/** Formata a data de criação (ISO) para exibição local. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

/**
 * Colunas da tabela de veículos.
 *
 * Ordenáveis (server-side — whitelist do backend): placa, status e data de
 * criação. As demais são apenas exibição.
 *
 * @param params Dependências de renderização (i18n + callbacks de ação).
 * @returns Colunas da `GenericTable`.
 */
export function createVehicleColumns({
  t,
  canManage,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string
  canManage: boolean
  onEdit: (vehicle: VehicleEntity) => void
  onDelete: (target: { id: string; name: string }) => void
}) {
  return [
    columnHelper.accessor('plate', {
      header: t('columns.plate'),
      enableSorting: true,
      size: 130,
    }),
    columnHelper.accessor('model', {
      header: t('columns.model'),
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor('color', {
      header: t('columns.color'),
      cell: ({ getValue }) => getValue() ?? '—',
    }),
    columnHelper.accessor((row) => row.vehicleType?.name ?? '—', {
      id: 'vehicleType',
      header: t('columns.type'),
      cell: ({ row }) => row.original.vehicleType?.name ?? '—',
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
      size: 120,
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('freePass', {
      header: t('columns.freePass'),
      size: 110,
      cell: ({ getValue }) => (
        <Badge
          className={cn(
            'shrink-0 px-2 text-xs',
            getValue() && 'border-amber-500 bg-amber-500/10 text-amber-700',
          )}
          variant="outline"
        >
          {getValue() ? t('freePass.yes') : t('freePass.no')}
        </Badge>
      ),
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

          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive size-8"
              onClick={(event) => {
                event.stopPropagation()
                onDelete({ id: row.original.id, name: row.original.plate })
              }}
              aria-label={t('toolbar.delete')}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    }),
  ]
}
