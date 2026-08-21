// Types
import type {
  ImportJobListResponse,
  ImportJobResponse,
  ImportJobsParams,
  ImportUploadResponse,
} from '#/features/import/types/import.types'

// Controller
import baseController from '#/shared/controller/base.controller'

/**
 * Service de importação de departamentos.
 * Responsável por toda comunicação com a API de importação de departamentos.
 */
class DepartmentsImportService {
  /**
   * Faz upload de um arquivo XLSX para importação de departamentos.
   *
   * @param file - Arquivo XLSX para upload.
   * @returns jobId e status inicial do job.
   */
  async upload(file: File): Promise<ImportUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return baseController.makeRequest({
      endpoint: '/departments/import',
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  }

  /**
   * Lista os jobs de importação de departamentos (histórico paginado).
   *
   * @param params - Filtro e paginação.
   * @returns Resposta paginada com os jobs.
   */
  async list(params?: ImportJobsParams): Promise<ImportJobListResponse> {
    const query = new URLSearchParams()

    query.set('type', 'DEPARTMENT')
    if (params?.limit !== undefined) {
      query.set('limit', String(params.limit))
    }
    if (params?.offset !== undefined) {
      query.set('offset', String(params.offset))
    }

    return baseController.makeRequest({
      endpoint: `/import-jobs?${query.toString()}`,
      method: 'GET',
    })
  }

  /**
   * Busca o status atual de um job de importação.
   *
   * @param jobId - ID do job.
   * @returns Dados atualizados do job.
   */
  async getJob(jobId: string): Promise<ImportJobResponse> {
    return baseController.makeRequest({
      endpoint: `/import-jobs/${jobId}`,
      method: 'GET',
    })
  }
}

export const departmentsImportService = new DepartmentsImportService()
