// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { resolveImportJobError } from '../lib/import-error.lib'

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
 * de `FAILED`, o erro da linha traduzido a partir do código e dos parâmetros que
 * o job guardou — ADR 0016 §6).
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

  // O texto do erro sai do código + parâmetros: a mensagem em português que o
  // servidor grava no job nunca é renderizada (ADR 0001 §1).
  const jobError = job ? resolveImportJobError(job) : null

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

            {job.status === 'FAILED' && jobError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">{t('detail.error')}</p>
                <p className="mt-1">{t(jobError.key, jobError.params)}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
