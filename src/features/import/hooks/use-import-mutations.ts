// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { parseImportError } from '../lib/parse-import-error'

// Types
import type { ImportUploadResponse } from '../types/import.types'

// Shared libs
import { getAPIErrorTranslationKey, isApiError } from '#/shared/lib/api-error'

/** Contrato mínimo de um service de importação (método de upload). */
export type ImportUploadServiceLike = {
  upload: (file: File) => Promise<ImportUploadResponse>
}

/** Chave de query do histórico de importação. */
const IMPORTS_QUERY_KEY = ['imports']

/**
 * Hook genérico de mutations de importação: upload do arquivo.
 *
 * Compartilhado por todas as sub-páginas de importação (não duplicar
 * componentes/hooks genéricos — AGENTS.md). Em sucesso, invalida o histórico
 * e mostra toast; em erro, tenta exibir a mensagem por linha
 * (`LINHA_{N}_{MSG}`) e cai no mapa de códigos padrão.
 *
 * @param params Service de importação e namespace de tradução da sub-página.
 * @returns Objeto com a mutation de upload.
 */
export function useImportMutations({
  service,
  namespace,
}: {
  service: ImportUploadServiceLike
  namespace: string
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(namespace)
  const { t: ti } = useTranslation('import')
  const { t: tc } = useTranslation('common')

  /** Mutation para enviar o arquivo de importação. */
  const uploadCsv = useMutation({
    mutationFn: (file: File) => service.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPORTS_QUERY_KEY })
      toast.success(t('notifications.upload-success'))
    },
    onError: (error) => {
      if (isApiError(error) && error.code) {
        const parsed = parseImportError(error.code)
        if (parsed) {
          toast.error(`${ti('upload.line')} ${parsed.line}: ${parsed.message}`)
          return
        }
      }
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { uploadCsv }
}
