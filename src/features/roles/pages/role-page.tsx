// React
import { useEffect, useMemo, useState } from 'react'

// Router
import { getRouteApi } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Toast
import { toast } from 'sonner'

// Icons
import { GoPlus } from 'react-icons/go'
import { Search } from 'lucide-react'

// Components
import { RoleCard } from '../components/role-card'
import { RoleFormDialog } from '../components/role-form-dialog'
import { RolePermissionsDialog } from '../components/role-permissions-dialog'

// Hooks
import { useRolesQuery } from '../hooks/use-roles-query'
import { useRoleMutations } from '../hooks/use-role-mutations'
import { useRoleHandlers } from '../hooks/use-role-handlers'

// Types
import type { RoleListParams, RoleStatusFilterValue } from '../types/roles.types'

// Routes
import { rolesPath } from '../routes/roles.route'

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

/** Acesso tipado aos search params da rota file-based de cargos. */
const routeApi = getRouteApi('/_private/management/roles')

/**
 * Página de gestão de cargos e permissões.
 *
 * Lista paginada de cargos (EntityList) com busca (debounce), criação/edição
 * via dialog, exclusão com confirmação (com aviso de desvinculação) e
 * gerenciamento de permissões por toggle individual. Cargo do sistema
 * (`isAdmin`) é somente leitura.
 */
export function RolesPage() {
  const { t } = useTranslation('roles')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManage = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_ROLES] }),
    [user],
  )

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<RoleListParams>(
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
    path: rolesPath,
    search: listParams,
  })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useRolesQuery(listParams)

  // --- Mutations ---
  const { createRole, updateRole, deleteRole } = useRoleMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    permissionsRole,
    statusValue,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
    setDeleteTarget,
    handleOpenPermissions,
    handleClosePermissions,
  } = useRoleHandlers({
    createRole,
    updateRole,
    deleteRole,
    search: { isActive: search.isActive },
    updateSearch,
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

  const roles = data?.data ?? []
  const total = data?.count ?? 0

  const emptyState = (
    <div className="space-y-2">
      <p className="text-foreground text-base font-semibold">{t('empty.title')}</p>
      <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
    </div>
  )

  const isFormSubmitting = createRole.isPending || updateRole.isPending

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <EntityList
        items={roles}
        total={total}
        loading={isPending}
        renderItem={(role) => (
          <RoleCard
            role={role}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            onManagePermissions={handleOpenPermissions}
            canManage={canManage}
          />
        )}
        filters={
          <>
            <div className="relative sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.status.label')}
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) => handleStatusChange(value as RoleStatusFilterValue)}
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
        <RoleFormDialog
          key={formState.mode === 'edit' ? formState.role?.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          role={formState.role}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Dialog de permissões */}
      <RolePermissionsDialog
        role={permissionsRole}
        onOpenChange={(open) => !open && handleClosePermissions()}
      />

      {/* Confirmação de exclusão (física, em cascata) */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.delete.title')}
        description={t('confirm.delete.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('confirm.delete.confirm')}
        cancelLabel={t('confirm.delete.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deleteRole.isPending}
      />
    </PageLayout>
  )
}
