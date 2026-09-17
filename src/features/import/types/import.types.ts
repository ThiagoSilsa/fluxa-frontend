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
  /** Texto em português do servidor — só para log; a tela traduz pelo código. */
  errorMessage: string | null
  /** Código da regra de planilha que reprovou a linha (ADR 0016 §6). */
  errorCode: string | null
  /** O que o texto da regra precisa (`{ line: 3, min: 2, max: 255 }`). */
  errorParams: Record<string, string | number> | null
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
  /** Preservado para log; a tela usa `errorCode`/`errorParams`. */
  errorMessage: string | null
  errorCode: string | null
  errorParams: Record<string, string | number> | null
  fileName: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  duration: string | null
  progressPercent: number
  isFinished: boolean
}

/** Campos do job usados para montar o texto do erro (o resto não importa). */
export type ImportJobErrorInput = Pick<
  ImportJobViewModel,
  'errorCode' | 'errorParams' | 'errorMessage'
>

/**
 * Erro do job pronto para o `t`: a chave i18n (qualificada quando é do conjunto
 * comum) e os parâmetros do texto.
 */
export type ImportJobErrorText = {
  key: string
  params: Record<string, string | number>
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
