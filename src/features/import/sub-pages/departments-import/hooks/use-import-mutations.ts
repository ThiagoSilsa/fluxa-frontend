// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Service
import { departmentsImportService } from '../services/departments-import.service'

// Lib
import { parseImportError } from '../../../lib/parse-import-error'

// Shared libs
import { getAPIErrorTranslationKey, isApiError } from '#/shared/lib/api-error'

/** Chave de query do histórico de importação. */
const IMPORTS_QUERY_KEY = ['imports']

/**
 * Hook de mutations de importação de departamentos: upload do arquivo.
 *
 * Em sucesso, invalida o histórico e mostra toast; em erro, tenta exibir a
 * mensagem por linha (`LINHA_{N}_{MSG}`) e cai no mapa de códigos padrão.
 *
 * @returns Objeto com a mutation de upload.
 */
export function useImportMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('departmentsImport')
  const { t: tc } = useTranslation('common')

  /** Mutation para enviar o arquivo de importação. */
  const uploadCsv = useMutation({
    mutationFn: (file: File) => departmentsImportService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPORTS_QUERY_KEY })
      toast.success(t('notifications.upload-success'))
    },
    onError: (error) => {
      if (isApiError(error) && error.code) {
        const parsed = parseImportError(error.code)
        if (parsed) {
          toast.error(`${t('upload.line')} ${parsed.line}: ${parsed.message}`)
          return
        }
      }
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { uploadCsv }
}
