// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { BlockRequestStatus } from '../types/access-requests.types'

// Shared
import { Badge } from '#/shared/components'

/** Cores do badge conforme o status da solicitação de bloqueio. */
const STATUS_CLASS: Record<BlockRequestStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-100 text-amber-800',
  APPROVED: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  REJECTED: 'border-red-300 bg-red-100 text-red-800',
  CANCELLED: 'border-muted bg-muted text-muted-foreground',
}

/**
 * Badge de status de uma solicitação de bloqueio ("minhas solicitações").
 *
 * Local à feature de solicitações (sem importar a feature de bloqueios).
 */
export function BlockRequestStatusBadge({ status }: { status: BlockRequestStatus }) {
  const { t } = useTranslation('accessRequests')

  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {t(`blockStatus.${status}`)}
    </Badge>
  )
}
