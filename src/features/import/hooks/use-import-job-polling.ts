// React
import { useEffect, useState } from 'react'

// Mappers
import { normalizeImportJob } from '../mappers/import.mapper'

// Types
import type { ImportJobResponse, ImportJobViewModel } from '../types/import.types'

/** Contrato mínimo de um service de importação (método de status). */
export type ImportJobServiceLike = {
  getJob: (jobId: string) => Promise<ImportJobResponse>
}

/** Intervalo do polling em milissegundos (ADR 0007 §9). */
const POLLING_INTERVAL_MS = 3000

/**
 * Hook genérico de polling do job ativo de importação. Compartilhado por
 * todas as sub-páginas (AGENTS.md).
 *
 * Enquanto o job não finaliza (`DONE`/`FAILED`), busca o status a cada 3s e
 * devolve o viewmodel atualizado. Ao finalizar, para e sinaliza via
 * `isFinished`.
 *
 * @param service Service de importação da sub-página.
 * @param jobId Id do job ativo (ou `null`).
 * @returns ViewModel do job e se está em polling.
 */
export function useImportJobPolling(service: ImportJobServiceLike, jobId: string | null) {
  const [job, setJob] = useState<ImportJobViewModel | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!jobId) {
      setJob(null)
      setIsPolling(false)
      return
    }

    let cancelled = false
    setIsPolling(true)

    const poll = async () => {
      while (!cancelled) {
        try {
          const response = await service.getJob(jobId)
          const normalized = normalizeImportJob(response)
          setJob(normalized)

          if (normalized.isFinished) {
            setIsPolling(false)
            return
          }
        } catch {
          // fallback silencioso — continua na próxima iteração
        }

        if (!cancelled) {
          await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS))
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
    }
  }, [service, jobId])

  return { job, isPolling }
}
