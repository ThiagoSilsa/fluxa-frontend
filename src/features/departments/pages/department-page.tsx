// React
import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { GoPlus } from 'react-icons/go'
import { Search } from 'lucide-react'

// Components
import { DepartmentCard } from '../components/department-card'
import { DepartmentFormDialog } from '../components/department-form-dialog'

// Hooks
import { useDepartmentsQuery } from '../hooks/use-departments-query'
import { useDepartmentMutations } from '../hooks/use-department-mutations'
import { useDepartmentHandlers } from '../hooks/use-department-handlers'

// Types
import type { DepartmentListParams, DepartmentStatusFilterValue } from '../types/departments.types'

// Routes
import { departmentsPath } from '../routes/departments.route'

// Shared components
import {
  Button,
  ConfirmDialog,
  EntityList,
  Header,
  Input,
  Label,
  PageLayout,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

// Shared hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { useEntityListSearch } from '#/shared/components/entity-list'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/** Acesso tipado aos search params da rota file-based. */
const routeApi = getRouteApi('/_private/management/departments')

/**
 * Página de gestão de departamentos.
 *
 * Lista paginada com busca, filtro de status, criação/edição em dialog e
 * exclusão física com confirmação (409 bloqueia quando há veículos vinculados
 * via `vehicle_department`). Acesso restrito a `MANAGE_DEPARTMENTS`.
 */
export function DepartmentPage() {
  const { t } = useTranslation('departments')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManage = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_DEPARTMENTS] }),
    [user],
  )

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<DepartmentListParams>(
    () => ({
      search: search.search,
      isActive: search.isActive,
      limit: search.limit,
      offset: search.offset,
    }),
    [search],
  )

  // --- Controles de paginação/busca (sincronizados com a URL) ---
  const { updateSearch, updateLimit, updateOffset } = useEntityListSearch({
    path: departmentsPath,
    search: listParams,
  })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useDepartmentsQuery(listParams)

  // --- Mutations ---
  const { createDepartment, updateDepartment, deleteDepartment } = useDepartmentMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  } = useDepartmentHandlers({
    updateSearch,
    search: { isActive: search.isActive },
    createDepartment,
    updateDepartment,
    deleteDepartment,
  })

  // --- Toast de erro da listagem ---
  useEffect(() => {
    if (error) {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    }
  }, [error, tc])

  // Sincroniza o input de busca com o parâmetro da URL
  useEffect(() => {
    setSearchInput(search.search ?? '')
  }, [search.search])

  // Atualiza a busca na URL após o debounce
  useEffect(() => {
    const trimmed = debouncedSearch.trim()
    if ((search.search ?? '') === trimmed) {
      return
    }
    updateSearch({ search: trimmed.length ? trimmed : undefined })
  }, [debouncedSearch, search.search, updateSearch])

  const departments = data?.data ?? []
  const total = data?.count ?? 0
  const isFormSubmitting = createDepartment.isPending || updateDepartment.isPending

  const emptyState = (
    <div className="space-y-2">
      <p className="text-foreground text-base font-semibold">{t('empty.title')}</p>
      <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
    </div>
  )

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <EntityList
        items={departments}
        total={total}
        loading={isPending}
        renderItem={(item) => (
          <DepartmentCard
            department={item}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            canManage={canManage}
          />
        )}
        filters={
          <>
            {/* Busca com ícone */}
            <div className="relative sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9"
              />
            </div>

            {/* Filtro de status */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.status.label')}
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) => handleStatusChange(value as DepartmentStatusFilterValue)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                  <SelectItem value="active">{t('filters.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('filters.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        toolbar={
          canManage && (
            <Button onClick={handleOpenCreate}>
              <GoPlus className="size-5" />
              {t('toolbar.create')}
            </Button>
          )
        }
        emptyState={emptyState}
        gridClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        pagination={{
          limit: search.limit,
          offset: search.offset,
          onLimitChange: updateLimit,
          onOffsetChange: updateOffset,
          labels: {
            limit: tc('pagination.limit'),
            first: tc('pagination.first'),
            previous: tc('pagination.previous'),
            next: tc('pagination.next'),
            last: tc('pagination.last'),
          },
        }}
      />

      {/* Dialog de criação/edição */}
      {formState ? (
        <DepartmentFormDialog
          key={formState.mode === 'edit' ? formState.department?.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          department={formState.department}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.delete.title')}
        description={t('confirm.delete.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('confirm.delete.confirm')}
        cancelLabel={t('confirm.delete.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deleteDepartment.isPending}
      />
    </PageLayout>
  )
}
