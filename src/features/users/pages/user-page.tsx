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
import { UserCard } from '../components/user-card'
import { UserFormDialog } from '../components/user-form-dialog'

// Hooks
import { useUsersQuery } from '../hooks/use-users-query'
import { useRoleOptions } from '../hooks/use-role-options'
import { useUserMutations } from '../hooks/use-user-mutations'
import { useUserHandlers } from '../hooks/use-user-handlers'

// Types
import type {
  UserListParams,
  UserStatusFilterValue,
  UserTypeFilterValue,
} from '../types/users.types'

// Routes
import { usersPath } from '../routes/users.route'

// Shared components
import {
  Button,
  ConfirmDialog,
  EntityList,
  Header,
  Input,
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

/** Acesso tipado aos search params da rota file-based de usuários. */
const routeApi = getRouteApi('/_private/management/users')

/**
 * Página de gestão de usuários.
 *
 * Lista paginada (EntityList) com busca, filtros de status e tipo (server-side),
 * criação já vinculada (com modo "vincular" via email-status), edição com
 * troca de cargo/senha, desativação com confirmação e governança de admin
 * (alvo is_admin somente leitura para não-admin).
 */
export function UsersPage() {
  const { t } = useTranslation('users')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManage = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_USERS] }),
    [user],
  )
  const isAdminActor = user?.isAdmin ?? false

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<UserListParams>(
    () => ({
      search: search.search,
      type: search.type,
      isActive: search.isActive,
      limit: search.limit,
      offset: search.offset,
    }),
    [search],
  )

  // --- Controles de paginação/busca (sincronizados com a URL) ---
  const { updateSearch, updateLimit, updateOffset } = useEntityListSearch({
    path: usersPath,
    search: listParams,
  })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useUsersQuery(listParams)
  const roleOptions = useRoleOptions(isAdminActor)

  // --- Mutations ---
  const { createUser, updateUser, deactivateUser, changePassword } = useUserMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    typeValue,
    handleTypeChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  } = useUserHandlers({
    updateSearch,
    search: { isActive: search.isActive, type: search.type },
    createUser,
    updateUser,
    deactivateUser,
    changePassword,
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

  const users = data?.data ?? []
  const total = data?.count ?? 0
  const isFormSubmitting = createUser.isPending || updateUser.isPending || changePassword.isPending

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
        items={users}
        total={total}
        loading={isPending}
        renderItem={(item) => (
          <UserCard
            user={item}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            canManage={canManage}
            isAdminActor={isAdminActor}
            currentUserId={user?.id}
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

            <Select
              value={statusValue}
              onValueChange={(value) => handleStatusChange(value as UserStatusFilterValue)}
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

            <Select
              value={typeValue}
              onValueChange={(value) => handleTypeChange(value as UserTypeFilterValue)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.type.all')}</SelectItem>
                <SelectItem value="EMPLOYEE">{t('types.EMPLOYEE')}</SelectItem>
                <SelectItem value="VISITOR">{t('types.VISITOR')}</SelectItem>
              </SelectContent>
            </Select>
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
        <UserFormDialog
          key={formState.mode === 'edit' ? formState.user?.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          user={formState.user}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          canManageAdmin={isAdminActor}
          roleOptions={roleOptions}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Confirmação de desativação */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.deactivate.title')}
        description={t('confirm.deactivate.description', {
          name: deleteTarget?.name ?? '',
        })}
        confirmLabel={t('confirm.deactivate.confirm')}
        cancelLabel={t('confirm.deactivate.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deactivateUser.isPending}
      />
    </PageLayout>
  )
}
