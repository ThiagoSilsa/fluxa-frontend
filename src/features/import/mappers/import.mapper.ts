// Types
import type { ImportJobEntity, ImportJobViewModel } from '../types/import.types'

/**
 * Converte a entidade de job em viewmodel para a UI.
 *
 * Calcula o que a tabela/cards precisam: progresso percentual, flag de
 * finalização e duração formatada.
 *
 * @param entity Entidade de job vinda da API.
 * @returns ViewModel de exibição.
 */
export function normalizeImportJob(entity: ImportJobEntity): ImportJobViewModel {
  const totalRows = entity.totalRows
  const processedRows = entity.processedRows ?? totalRows

  return {
    id: entity.id,
    type: entity.type,
    status: entity.status,
    totalRows,
    processedRows,
    successCount: entity.successCount,
    errorCount: entity.errorCount,
    errorMessage: entity.errorMessage,
    fileName: entity.fileName ?? '-',
    createdAt: entity.createdAt,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    progressPercent: totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0,
    isFinished: entity.status === 'DONE' || entity.status === 'FAILED',
    duration: formatDuration(entity.createdAt, entity.completedAt),
  }
}

/**
 * Formata a duração entre o início (createdAt) e o fim (completedAt) do job.
 *
 * @param start Data de criação (ISO).
 * @param end Data de conclusão (ISO) ou `null`.
 * @returns Duração formatada (`Xs`, `Xmin Ys`) ou `null` sem fim.
 */
export function formatDuration(start: string, end: string | null): string | null {
  if (!end) {
    return null
  }

  const ms = new Date(end).getTime() - new Date(start).getTime()
  const seconds = Math.floor(ms / 1000)

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}min ${remainingSeconds}s`
}
