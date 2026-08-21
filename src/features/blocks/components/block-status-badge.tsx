// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { getBlockStatusLabelKey } from '../lib/block.lib'

// Types
import type { VehicleBlockStatus } from '../types/blocks.types'

// Shared
import { Badge } from '#/shared/components'

/** Cores do badge conforme o status do bloqueio. */
const STATUS_CLASS: Record<VehicleBlockStatus, string> = {
  ACTIVE: 'border-red-300 bg-red-100 text-red-800',
  REVOKED: 'border-muted bg-muted text-muted-foreground',
}

/**
 * Badge de status de um bloqueio (ativo/revogado).
 */
export function BlockStatusBadge({ status }: { status: VehicleBlockStatus }) {
  const { t } = useTranslation('blocks')

  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {t(getBlockStatusLabelKey(status))}
    </Badge>
  )
}
