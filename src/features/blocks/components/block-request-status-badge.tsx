// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { getBlockRequestStatusLabelKey } from '../lib/block.lib'

// Types
import type { BlockRequestStatus } from '../types/blocks.types'

// Shared
import { Badge } from '#/shared/components'

/** Cores do badge conforme o status da solicitação. */
const STATUS_CLASS: Record<BlockRequestStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-100 text-amber-800',
  APPROVED: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  REJECTED: 'border-red-300 bg-red-100 text-red-800',
  CANCELLED: 'border-muted bg-muted text-muted-foreground',
}

/**
 * Badge de status de uma solicitação de bloqueio.
 */
export function BlockRequestStatusBadge({ status }: { status: BlockRequestStatus }) {
  const { t } = useTranslation('blocks')

  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {t(getBlockRequestStatusLabelKey(status))}
    </Badge>
  )
}
