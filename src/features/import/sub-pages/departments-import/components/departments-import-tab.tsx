// React
import { useEffect, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// TanStack Query
import { useQueryClient } from '@tanstack/react-query'

// Columns
import { createJobsColumns } from '../config/jobs-columns'

// Components
import { FileUploadCard, JobDetailDialog, JobTrackingCard } from '../../../components'
import { GenericTable } from '#/shared/components'

// Hooks
import { useImportJobPolling } from '../hooks/use-import-job-polling'
import { useImportMutations } from '../hooks/use-import-mutations'
import { useImportsQuery } from '../hooks/use-imports-query'
import { useDownloadTemplate } from '../hooks/use-download-template'

// Mappers
import { normalizeImportJob } from '../../../mappers/import.mapper'

// Types
import type { ImportJobViewModel, ImportUploadResponse } from '../../../types/import.types'
import type { useGenericTableSearch } from '#/shared/components/generic-table'

/** Tipo do estado de paginação/ordenação da URL (retorno do hook). */
type ImportTable = ReturnType<typeof useGenericTableSearch>

/**
 * Aba de importação de departamentos: upload + acompanhamento + histórico.
 *
 * Orquestra o download do template, o upload (mutation), o polling do job
 * ativo e o histórico paginado (`GenericTable`), com detalhes do job ao clicar
 * na linha.
 *
 * @param props Propriedades da aba.
 */
export function DepartmentsImportTab({
  table,
}: {
  /** Estado de paginação/ordenação via URL (useGenericTableSearch). */
  table: ImportTable
}) {
  const { t } = useTranslation('departmentsImport')
  const queryClient = useQueryClient()

  // Job ativo (após upload)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const { job: activeJob } = useImportJobPolling(activeJobId)

  // Histórico paginado
  const { data, isLoading } = useImportsQuery({
    limit: table.limit ?? 20,
    offset: table.offset ?? 0,
  })

  // Quando o job ativo finaliza, limpa o estado e invalida o histórico
  useEffect(() => {
    if (activeJob && activeJob.isFinished) {
      setActiveJobId(null)
      queryClient.invalidateQueries({ queryKey: ['imports'] })
    }
  }, [activeJob, queryClient])

  // Upload
  const { uploadCsv } = useImportMutations()

  const handleUpload = (file: File) => {
    uploadCsv.mutate(file, {
      onSuccess: (response: ImportUploadResponse) => {
        setActiveJobId(response.jobId)
      },
    })
  }

  // Download do template (client — ExcelJS)
  const handleDownloadTemplate = useDownloadTemplate(t)

  // Detalhes
  const [selectedJob, setSelectedJob] = useState<ImportJobViewModel | null>(null)

  const jobs = (data?.data ?? []).map(normalizeImportJob)
  const total = data?.count ?? 0
  const showActiveJob = activeJob && !activeJob.isFinished

  return (
    <div className="flex flex-col gap-6">
      {showActiveJob && <JobTrackingCard job={activeJob} />}

      <FileUploadCard
        title={t('upload.title')}
        description={t('upload.description')}
        onUpload={handleUpload}
        isPending={uploadCsv.isPending}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <GenericTable
        data={jobs}
        columns={createJobsColumns(t)}
        loading={isLoading}
        total={total}
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        onPageChange={table.onPageChange}
        onPageSizeChange={table.onPageSizeChange}
        onRowClick={(job) => setSelectedJob(job)}
        emptyState={
          <p className="text-muted-foreground py-8 text-center text-sm">{t('history.empty')}</p>
        }
        paginationLabels={{
          limit: t('pagination.limit'),
          first: t('pagination.first'),
          previous: t('pagination.previous'),
          next: t('pagination.next'),
          last: t('pagination.last'),
        }}
      />

      <JobDetailDialog
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJob(null)
          }
        }}
      />
    </div>
  )
}
