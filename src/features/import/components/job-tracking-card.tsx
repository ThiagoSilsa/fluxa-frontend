// Icons
import { Loader2 } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { ImportJobViewModel } from '../types/import.types'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '#/shared/components'

// Components
import { JobStatusBadge } from './job-status-badge'

/**
 * Card de acompanhamento do job ativo (barra de progresso + contadores).
 *
 * @param props Propriedades do card.
 */
export function JobTrackingCard({ job }: { job: ImportJobViewModel }) {
  const { t } = useTranslation('import')

  const isProcessing = job.status === 'PROCESSING'
  const isPendingStatus = job.status === 'PENDING'

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('active-job.title')}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t('active-job.description', { fileName: job.fileName })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{t('active-job.status')}</span>
          <JobStatusBadge status={job.status} />
        </div>

        {isPendingStatus && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('active-job.pending')}
          </div>
        )}

        {isProcessing && (
          <>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${job.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('active-job.progress', {
                  processed: job.processedRows,
                  total: job.totalRows,
                })}
              </span>
              <span className="font-medium">{job.progressPercent}%</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
