// i18n
import { useTranslation } from 'react-i18next'

// TanStack Router
import { useNavigate } from '@tanstack/react-router'

// Hooks
import { useGenericTableSearch } from '#/shared/components/generic-table'

// Routes
import { importsPath } from '../routes/import.route'

// Types
import type { ImportSearch } from '../routes/import.route'

// Sub-pages
import { DepartmentsImportTab } from '../sub-pages/departments-import/components/departments-import-tab'

/**
 * Página de importações — abas por tipo (departamentos, veículos, usuários,
 * vínculo usuário-veículo), cada uma com upload, acompanhamento e histórico.
 *
 * Ler a URL é papel da rota, não da página: a página recebe `search` e a
 * paginação/ordenação vive na URL (compartilhável/recarregável).
 *
 * @param props Propriedades da página.
 */
export function ImportPage({ search }: { search: ImportSearch }) {
  const { t } = useTranslation('mainLayout')
  const navigate = useNavigate()

  // Paginação/ordenação do histórico via URL
  const table = useGenericTableSearch({ path: importsPath, search })

  // TODO: adicionar abas de veículos, usuários e vínculo usuário-veículo (M7)
  const tabs = [
    {
      id: 'departments',
      label: t('sidebar.items.departments'),
    },
  ]

  const activeTab = search.tab ?? 'departments'

  const handleTabChange = (tabId: string) => {
    void navigate({
      to: importsPath,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        tab: tabId,
        offset: 0,
      }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'departments' && <DepartmentsImportTab table={table} />}
    </div>
  )
}
