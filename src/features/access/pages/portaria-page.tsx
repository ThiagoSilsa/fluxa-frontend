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

// Config
import { createAccessRecordColumns } from '../config/access-record-columns'

// Components
import { AccessRegisterDialog } from '../components/access-register-dialog'
import { DeviceEntranceSelect } from '../components/device-entrance-select'

// Hooks
import { useAccessRecordsQuery } from '../hooks/use-access-records-query'

// Lib
import {
  ALL_FILTER,
  canRegisterDenial,
  canRegisterEntry,
  canRegisterExit,
  getRecordEntranceOptions,
  resolveEntranceFilter,
} from '../lib/access.lib'
import { getDeviceEntranceId, setDeviceEntranceId } from '../lib/device-entrance'

// Mappers
import { toIsoDayRange } from '../mappers/access.mapper'

// Types
import type { AccessRecordKind, AccessRecordsParams } from '../types/access.types'

// Routes
import { portariaPath } from '../routes/portaria.route'

// Shared components
import {
  Button,
  GenericTable,
  Header,
  Input,
  Label,
  PageLayout,
  PagePlaceholder,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

// Shared hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { useGenericTableSearch } from '#/shared/components/generic-table'

// Shared libs
import { canAccess } from '#/shared/lib/auth-access'
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'
import { PermissionCode } from '#/shared/enum/permission-code'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/** Acesso tipado aos search params da rota file-based. */
const routeApi = getRouteApi('/_private/portaria')

/** Tipos de registro oferecidos no filtro. */
const KIND_FILTERS: AccessRecordKind[] = ['ENTRY', 'EXIT', 'DENIAL']

/**
 * Página da portaria — **lista operacional** do que passou pelo balcão
 * (entradas, saídas e impedimentos) com o botão "Registrar".
 *
 * O feed vem de `GET /access/records`, já ordenado (`occurredAt DESC`) e com
 * atualização automática (15s), para a tela refletir o que outro dispositivo
 * registrou. Filtros (tipo, placa, período, portaria) e paginação vivem na URL;
 * a portaria do dispositivo (regra 61) é o filtro padrão e é o que os registros
 * do modal carimbam.
 *
 * Acesso: qualquer uma das permissões de registro (`REGISTER_ENTRY`,
 * `REGISTER_EXIT`, `REGISTER_DENIAL`).
 */
export function PortariaPage() {
  const { t } = useTranslation('access')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  // --- Search params da rota ---
  const search = routeApi.useSearch()

  // --- Permissões ---
  const permissions = user?.permissionCodes
  const canOpenPortaria = useMemo(
    () =>
      canAccess(user, {
        permissions: [
          PermissionCode.REGISTER_ENTRY,
          PermissionCode.REGISTER_EXIT,
          PermissionCode.REGISTER_DENIAL,
        ],
      }),
    [user],
  )
  const canRegister =
    canRegisterEntry(permissions) || canRegisterExit(permissions) || canRegisterDenial(permissions)

  // --- Portaria do dispositivo (persistida no localStorage) ---
  const [deviceEntranceId, setDeviceEntranceIdState] = useState<string | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)

  useEffect(() => {
    setDeviceEntranceIdState(getDeviceEntranceId())
  }, [])

  const handleDeviceEntranceChange = (entranceId: string | null) => {
    setDeviceEntranceId(entranceId)
    setDeviceEntranceIdState(entranceId)
  }

  // --- Controles da GenericTable (paginação via URL) ---
  const { pageIndex, pageSize, updateSearch, onPageChange, onPageSizeChange } =
    useGenericTableSearch({ path: portariaPath, search })

  // --- Filtro de placa com debounce ---
  const [plateInput, setPlateInput] = useState(search.plate ?? '')
  const debouncedPlate = useDebouncedValue(plateInput, 400)

  useEffect(() => {
    setPlateInput(search.plate ?? '')
  }, [search.plate])

  useEffect(() => {
    const trimmed = debouncedPlate.trim()
    if ((search.plate ?? '') === trimmed) {
      return
    }
    updateSearch({ plate: trimmed.length ? trimmed : undefined })
  }, [debouncedPlate, search.plate, updateSearch])

  // --- Query do feed ---
  const listParams = useMemo<AccessRecordsParams>(
    () => ({
      kind: search.kind,
      plate: search.plate,
      ...toIsoDayRange(search.dateFrom, search.dateTo),
      entranceId: resolveEntranceFilter(search.entranceId, deviceEntranceId),
      limit: search.limit,
      offset: search.offset,
    }),
    [search, deviceEntranceId],
  )

  const { data, isPending, error } = useAccessRecordsQuery(listParams)

  useEffect(() => {
    if (error) {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    }
  }, [error, tc])

  const records = data?.data ?? []
  const total = data?.count ?? 0
  const entranceOptions = getRecordEntranceOptions(data?.parameters)
  const columns = useMemo(() => createAccessRecordColumns({ t }), [t])
  const listEntranceValue = search.entranceId ?? deviceEntranceId ?? ALL_FILTER

  if (!canOpenPortaria) {
    return (
      <PageLayout>
        <PagePlaceholder title={tc('no-access.title')} />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DeviceEntranceSelect
            entrances={entranceOptions}
            value={deviceEntranceId}
            onChange={handleDeviceEntranceChange}
          />
          {canRegister ? (
            <Button type="button" onClick={() => setRegisterOpen(true)}>
              <GoPlus className="size-5" />
              {t('records.register')}
            </Button>
          ) : null}
        </div>
      </Header>

      <GenericTable
        data={records}
        columns={columns}
        loading={isPending}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        paginationLabels={{
          limit: tc('pagination.limit'),
          first: tc('pagination.first'),
          previous: tc('pagination.previous'),
          next: tc('pagination.next'),
          last: tc('pagination.last'),
        }}
        getRowKey={(row) => row.id}
        getRowAriaLabel={(row) => t('records.aria.row', { plate: row.plate })}
        expandLabels={{
          expand: t('records.expand.expand'),
          collapse: t('records.expand.collapse'),
        }}
        renderExpandedRow={(row) => (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              {t('records.observation.label')}
            </p>
            <p>{row.observation ?? t('records.observation.empty')}</p>
          </div>
        )}
        filters={
          <>
            {/* Busca por placa (parcial, com debounce) */}
            <div className="relative sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={plateInput}
                onChange={(event) => setPlateInput(event.target.value)}
                placeholder={t('records.filters.plate.placeholder')}
                aria-label={t('records.columns.plate')}
                className="pl-9 uppercase"
              />
            </div>

            {/* Tipo de registro */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('records.filters.kind.label')}
              </Label>
              <Select
                value={search.kind ?? ALL_FILTER}
                onValueChange={(value) =>
                  updateSearch({
                    kind: value === ALL_FILTER ? undefined : (value as AccessRecordKind),
                  })
                }
              >
                <SelectTrigger className="w-40" aria-label={t('records.filters.kind.label')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t('records.filters.kind.all')}</SelectItem>
                  {KIND_FILTERS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {t(`records.kind.${kind}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período (dias inclusivos) */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="records-date-from"
                className="text-muted-foreground shrink-0 text-xs font-medium"
              >
                {t('records.filters.period.label')}
              </Label>
              <Input
                id="records-date-from"
                type="date"
                value={search.dateFrom ?? ''}
                onChange={(event) => updateSearch({ dateFrom: event.target.value || undefined })}
                aria-label={t('records.filters.period.from')}
                className="w-36"
              />
              <Input
                type="date"
                value={search.dateTo ?? ''}
                onChange={(event) => updateSearch({ dateTo: event.target.value || undefined })}
                aria-label={t('records.filters.period.to')}
                className="w-36"
              />
            </div>

            {/* Portaria */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('records.filters.entrance.label')}
              </Label>
              <Select
                value={listEntranceValue}
                onValueChange={(value) => updateSearch({ entranceId: value })}
              >
                <SelectTrigger className="w-48" aria-label={t('records.filters.entrance.label')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t('records.filters.entrance.all')}</SelectItem>
                  {entranceOptions.map((entrance) => (
                    <SelectItem key={entrance.id} value={entrance.id}>
                      {entrance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        }
        emptyState={
          <div className="space-y-2">
            <p className="text-foreground text-base font-semibold">{t('records.empty.title')}</p>
            <p className="text-muted-foreground text-sm">{t('records.empty.description')}</p>
          </div>
        }
      />

      {/* Modal único de registro: placa → ficha → ação → resultado */}
      <AccessRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        permissions={permissions}
        entranceId={deviceEntranceId}
      />
    </PageLayout>
  )
}
