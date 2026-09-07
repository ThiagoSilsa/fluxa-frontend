// i18n
import { useTranslation } from 'react-i18next'

// TanStack Router
import { useNavigate } from '@tanstack/react-router'

// i18next
import type { TFunction } from 'i18next'

// Hooks
import { useGenericTableSearch } from '#/shared/components/generic-table'

// Routes
import { importsPath } from '../routes/import.route'

// Types
import type { ImportSearch } from '../routes/import.route'

// Components
import { ImportTab } from '../components/import-tab'
import type { ImportServiceLike } from '../components/import-tab'

// Services
import { departmentsImportService } from '../sub-pages/departments-import/services/departments-import.service'
import { vehiclesImportService } from '../sub-pages/vehicles-import/services/vehicles-import.service'
import { usersImportService } from '../sub-pages/users-import/services/users-import.service'
import { userVehiclesImportService } from '../sub-pages/user-vehicles-import/services/user-vehicles-import.service'

// Template downloaders
import { buildDepartmentsTemplateDownloader } from '../sub-pages/departments-import/lib/build-departments-template-downloader.lib'
import { buildVehiclesTemplateDownloader } from '../sub-pages/vehicles-import/lib/build-vehicles-template-downloader.lib'
import { buildUsersTemplateDownloader } from '../sub-pages/users-import/lib/build-users-template-downloader.lib'
import { buildUserVehiclesTemplateDownloader } from '../sub-pages/user-vehicles-import/lib/build-user-vehicles-template-downloader.lib'

// Shared
import { Button, Header, PageLayout } from '#/shared/components'

/** Estado de paginação/ordenação via URL (retorno do hook). */
type ImportTable = ReturnType<typeof useGenericTableSearch>

/** Config de uma aba de importação. */
type ImportTabConfig = {
  id: string
  namespace: string
  service: ImportServiceLike
  buildDownloader: (t: TFunction) => () => Promise<void>
}

/**
 * Botão de subpágina (modalidade) no padrão das demais telas (portaria/blocks).
 *
 * O rótulo vem do namespace da própria sub-página (`tab.label`), que já
 * centraliza a tradução de cada modalidade.
 *
 * @param props Estado ativo, namespace e ação de troca.
 */
function TabButton({
  active,
  namespace,
  onClick,
}: {
  active: boolean
  namespace: string
  onClick: () => void
}) {
  const { t } = useTranslation(namespace)

  return (
    <Button type="button" variant={active ? 'default' : 'outline'} onClick={onClick}>
      {t('tab.label')}
    </Button>
  )
}

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
  const { t } = useTranslation('import')
  const navigate = useNavigate()

  const tabs: ImportTabConfig[] = [
    {
      id: 'departments',
      namespace: 'departmentsImport',
      service: departmentsImportService,
      buildDownloader: buildDepartmentsTemplateDownloader,
    },
    {
      id: 'vehicles',
      namespace: 'vehiclesImport',
      service: vehiclesImportService,
      buildDownloader: buildVehiclesTemplateDownloader,
    },
    {
      id: 'users',
      namespace: 'usersImport',
      service: usersImportService,
      buildDownloader: buildUsersTemplateDownloader,
    },
    {
      id: 'user-vehicles',
      namespace: 'userVehiclesImport',
      service: userVehiclesImportService,
      buildDownloader: buildUserVehiclesTemplateDownloader,
    },
  ]

  // Paginação/ordenação do histórico via URL
  const table = useGenericTableSearch({ path: importsPath, search })

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
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      {/* Subpáginas (modalidades) */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            namespace={tab.namespace}
            onClick={() => handleTabChange(tab.id)}
          />
        ))}
      </div>

      {tabs.map((tab) => {
        if (activeTab !== tab.id) {
          return null
        }
        return <TabContent key={tab.id} config={tab} table={table} />
      })}
    </PageLayout>
  )
}

/**
 * Renderiza a aba ativa com o `ImportTab` genérico (builda o downloader do
 * template da sub-página).
 *
 * @param props Configuração da aba + estado de tabela.
 */
function TabContent({ config, table }: { config: ImportTabConfig; table: ImportTable }) {
  const { t } = useTranslation(config.namespace)

  return (
    <ImportTab
      table={table}
      service={config.service}
      namespace={config.namespace}
      onDownloadTemplate={config.buildDownloader(t)}
    />
  )
}
