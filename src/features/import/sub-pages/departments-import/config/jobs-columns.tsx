// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Components
import { JobStatusBadge } from '../../../components/job-status-badge'

// Types
import type { ImportJobViewModel } from '../../../types/import.types'

const columnHelper = createColumnHelper<ImportJobViewModel>()

/**
 * Colunas da tabela de histórico de importações.
 *
 * @param t Função de tradução da sub-página.
 * @returns Colunas da `GenericTable`.
 */
export function createJobsColumns(t: (key: string) => string) {
  return [
    columnHelper.accessor('fileName', {
      header: t('columns.fileName'),
      size: 200,
    }),
    columnHelper.accessor('status', {
      header: t('columns.status'),
      cell: ({ getValue }) => <JobStatusBadge status={getValue()} />,
      size: 120,
    }),
    columnHelper.accessor('totalRows', {
      header: t('columns.rows'),
      size: 80,
    }),
    columnHelper.accessor('successCount', {
      header: t('columns.success'),
      size: 90,
    }),
    columnHelper.accessor('errorCount', {
      header: t('columns.errors'),
      size: 80,
    }),
    columnHelper.accessor('createdAt', {
      header: t('columns.createdAt'),
      cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      size: 160,
    }),
    columnHelper.accessor('duration', {
      header: t('columns.duration'),
      cell: ({ getValue }) => getValue() ?? '-',
      size: 90,
    }),
  ]
}
