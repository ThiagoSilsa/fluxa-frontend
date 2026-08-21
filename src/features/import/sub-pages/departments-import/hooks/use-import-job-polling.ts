// React
import { useEffect, useState } from 'react'

// Service
import { departmentsImportService } from '../services/departments-import.service'

// Mappers
import { normalizeImportJob } from '../../../mappers/import.mapper'

// Types
import type { ImportJobViewModel } from '../../../types/import.types'

/** Intervalo do polling em milissegundos (ADR 0007 §9). */
const POLLING_INTERVAL_MS = 3000

/**
 * Hook de polling do job ativo de importação.
 *
 * Enquanto o job não finaliza (`DONE`/`FAILED`), busca o status a cada 3s e
 * devolve o viewmodel atualizado. Ao finalizar, para e sinaliza via
 * `isFinished`.
 *
 * @param jobId Id do job ativo (ou `null`).
 * @returns ViewModel do job e se está em polling.
 */
export function useImportJobPolling(jobId: string | null) {
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
          const response = await departmentsImportService.getJob(jobId)
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
  }, [jobId])

  return { job, isPolling }
}
