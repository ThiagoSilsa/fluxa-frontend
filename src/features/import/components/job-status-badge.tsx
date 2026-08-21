// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { JobStatus } from '../types/import.types'

/** Estilos por status do job. */
const STATUS_STYLES: Record<JobStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  PROCESSING: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

/**
 * Badge de status de um job de importação.
 *
 * @param props Propriedades do badge.
 */
export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { t } = useTranslation('import')

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {t(`job-status.${status}`)}
    </span>
  )
}
