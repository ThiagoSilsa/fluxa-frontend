/** Status possíveis de um job de importação. */
export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'

/** Tipo de importação (enum `import_job_type` do backend). */
export type ImportType = 'DEPARTMENT' | 'VEHICLE' | 'USER' | 'USER_VEHICLE'

/** Resposta do upload de arquivo. */
export type ImportUploadResponse = {
  jobId: string
  status: JobStatus
}

/** Entidade de job de importação (vinda da API). */
export type ImportJobEntity = {
  id: string
  type: ImportType
  status: JobStatus
  totalRows: number
  processedRows: number
  successCount: number
  errorCount: number
  errorMessage: string | null
  fileName: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

/** ViewModel para exibição na UI (após mapper). */
export type ImportJobViewModel = {
  id: string
  type: ImportType
  status: JobStatus
  totalRows: number
  processedRows: number
  successCount: number
  errorCount: number
  errorMessage: string | null
  fileName: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  duration: string | null
  progressPercent: number
  isFinished: boolean
}

/** Resposta paginada da API (formato padrão SOMAR). */
export type PaginatedResponse<T> = {
  limit: number
  offset: number
  count: number
  data: T[]
}

/** Parâmetros para listagem de jobs. */
export type ImportJobsParams = {
  type?: string
  limit?: number
  offset?: number
}

export type ImportJobListResponse = PaginatedResponse<ImportJobEntity>
export type ImportJobResponse = ImportJobEntity

/** Config de uma aba do template XLSX. */
export type SheetConfig = {
  name: string
  headers?: string[]
  exampleRow?: string[]
  rows?: (string | null)[][]
}

/** Config de download do template. */
export type DownloadTemplateConfig = {
  sheets: SheetConfig[]
  filename: string
}
