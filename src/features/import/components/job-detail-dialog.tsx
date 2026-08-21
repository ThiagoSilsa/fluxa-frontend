// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { ImportJobViewModel } from '../types/import.types'

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/shared/components'

// Components
import { JobStatusBadge } from './job-status-badge'

/**
 * Diálogo de detalhes de um job do histórico (contadores, duração e, no caso
 * de `FAILED`, a `errorMessage` retornada pela API).
 *
 * @param props Propriedades do diálogo.
 */
export function JobDetailDialog({
  job,
  open,
  onOpenChange,
}: {
  job: ImportJobViewModel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('import')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{job?.fileName}</DialogTitle>
          <DialogDescription>{t('detail.description', { type: job?.type })}</DialogDescription>
        </DialogHeader>

        {job && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('detail.status')}</span>
              <JobStatusBadge status={job.status} />
            </div>
            <div className="flex justify-between">
              <span>{t('detail.rows')}</span>
              <span>{job.totalRows}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.success')}</span>
              <span>{job.successCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.errors')}</span>
              <span>{job.errorCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('detail.duration')}</span>
              <span>{job.duration ?? '-'}</span>
            </div>

            {job.status === 'FAILED' && job.errorMessage && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">{t('detail.error')}</p>
                <p className="mt-1">{job.errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
