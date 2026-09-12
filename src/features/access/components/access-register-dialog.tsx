// React
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import {
  DEFAULT_REGISTRATION_VALUES,
  createAccessRegistrationSchema,
} from '../schemas/access-registration.schema'

// Components
import { AccessDenialForm } from './access-denial-form'
import type { AccessDenialFormValues } from './access-denial-form'
import { AccessDepartmentSelect } from './access-department-select'
import { AccessDriverPicker } from './access-driver-picker'
import { AccessRegistrationFields } from './access-registration-fields'
import { AccessResultCard } from './access-result-card'
import { AccessPlateSummary, AccessVerdictCard } from './access-verdict-card'
import { QrResolveDialog } from './qr-resolve-dialog'

// Hooks
import { useAccessContextQuery } from '../hooks/use-access-context-query'
import { useAccessMutations } from '../hooks/use-access-mutations'
import { useDepartmentOptionsQuery } from '../hooks/use-department-options-query'
import { useOpenAccessQuery } from '../hooks/use-open-access-query'

// Lib
import {
  canRegisterDenial,
  canRegisterEntry,
  canRegisterExit,
  canRequestBlock,
  denialReasonFromVerdict,
  deriveRegistrationScenario,
  getVerdictLabelKey,
  isVerdictAllow,
  needsRequestBlock,
} from '../lib/access.lib'

// Mappers
import {
  toRegisterDenialPayload,
  toRegisterEntryPayload,
  toRegisterExitPayload,
  toRegisterRequestBlock,
} from '../mappers/access.mapper'

// Types
import type { AccessRegistrationFormValues } from '../schemas/access-registration.schema'
import type {
  AccessContextResponse,
  AccessEntryResponse,
  AccessExitResponse,
  AccessRequestType,
  EntryDenialReason,
  MovementSource,
  RegisterDenialResponse,
  RegisterEntryRequestPayload,
} from '../types/access.types'

// Utils
import { isValidBrazilianPlate, normalizePlate } from '../utils/plate'

// Shared hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'

// Shared
import { Button, ConfirmDialog, FormDialog, Input, Label } from '#/shared/components'

/** Tipo de registro escolhido no modal. */
type RegisterType = 'ENTRY' | 'EXIT' | 'DENIAL'

/** Passos do modal: placa → ficha (veredito) → resultado. */
type RegisterStep = 'plate' | 'context' | 'result'

export type AccessRegisterDialogProps = {
  /** Controla a abertura do modal. */
  open: boolean
  /** Callback de abertura/fechamento. */
  onOpenChange: (open: boolean) => void
  /** Permissões da sessão (define o que o porteiro pode registrar). */
  permissions: string[] | undefined
  /** Portaria do dispositivo (regra 61) — carimba o registro. */
  entranceId?: string | null
}

/**
 * Modal único da portaria: **placa → ficha (veredito) → ação → resultado**.
 *
 * O porteiro digita/lê a placa, o servidor devolve a ficha com o veredito
 * (ADR 0014 §2) e o modal mostra **uma** ação principal — liberar, registrar
 * saída ou impedir. O tipo é inferido (placa já dentro → saída; senão →
 * entrada) e a escolha explícita do porteiro sobrepõe, sem ser descartada ao
 * trocar de placa.
 *
 * Nada de regra de negócio aqui: veredito, prazo, capacidade e necessidade de
 * solicitação vêm do contexto; o modal só coleta o que falta e monta o payload.
 */
export function AccessRegisterDialog({
  open,
  onOpenChange,
  permissions,
  entranceId,
}: AccessRegisterDialogProps) {
  const { t } = useTranslation('access')

  // --- Passos e dados coletados ---
  const [step, setStep] = useState<RegisterStep>('plate')
  const [plateInput, setPlateInput] = useState('')
  const [plateInvalid, setPlateInvalid] = useState(false)
  const [searchedPlate, setSearchedPlate] = useState<string | null>(null)
  const [source, setSource] = useState<MovementSource | undefined>(undefined)
  const [explicitType, setExplicitType] = useState<RegisterType | null>(null)
  const [driverUserId, setDriverUserId] = useState('')
  const [driverSearch, setDriverSearch] = useState('')
  const [isNewDriver, setIsNewDriver] = useState(false)
  const [departmentId, setDepartmentId] = useState<string | null>(null)
  const [passenger, setPassenger] = useState('')
  const [passengerInvalid, setPassengerInvalid] = useState(false)
  const [denialReason, setDenialReason] = useState<EntryDenialReason | undefined>(undefined)
  const [denialObservation, setDenialObservation] = useState('')
  const [confirm, setConfirm] = useState<'overCapacity' | 'reentry' | null>(null)
  const [qrOpen, setQrOpen] = useState(false)

  /**
   * Bloco `request` já validado, aguardando a confirmação de vaga
   * cheia/reentrada (o confirmar não revalida o formulário).
   */
  const pendingRelease = useRef<{ request?: RegisterEntryRequestPayload } | null>(null)

  // --- Resultados ---
  const [entryResult, setEntryResult] = useState<AccessEntryResponse | null>(null)
  const [exitResult, setExitResult] = useState<AccessExitResponse | null>(null)
  const [denialResult, setDenialResult] = useState<RegisterDenialResponse | null>(null)

  const { registerEntry, registerExit, registerDenial } = useAccessMutations()

  // --- Permissões → tipos oferecidos ---
  const allowedTypes = useMemo<RegisterType[]>(() => {
    const types: RegisterType[] = []
    if (canRegisterEntry(permissions)) {
      types.push('ENTRY')
    }
    if (canRegisterExit(permissions)) {
      types.push('EXIT')
    }
    if (canRegisterDenial(permissions)) {
      types.push('DENIAL')
    }
    return types
  }, [permissions])

  // --- Busca de condutor (debounce antes de ir para a query) ---
  const debouncedSearch = useDebouncedValue(driverSearch, 400)

  // --- Ficha da placa (contexto + veredito) ---
  // O `search` traz as sugestões de condutor e o `driverUserId` faz o veredito
  // refletir quem o porteiro escolheu (ticket 01); o `departmentId` traz a
  // ocupação do setor confirmado (regra 27).
  const contextQuery = useAccessContextQuery(
    open && searchedPlate
      ? {
          plate: searchedPlate,
          search: debouncedSearch.trim() || undefined,
          departmentId: departmentId ?? undefined,
          driverUserId: driverUserId || undefined,
        }
      : null,
  )
  const context: AccessContextResponse | null = contextQuery.data ?? null

  // --- Setores ativos (troca do setor na ficha) ---
  const departmentOptionsQuery = useDepartmentOptionsQuery(open && step === 'context')

  // --- Inferência do tipo (a escolha explícita sempre vence) ---
  const inferredType: RegisterType = context?.openAccesses.length ? 'EXIT' : 'ENTRY'
  const activeType = explicitType ?? inferredType
  const type = allowedTypes.includes(activeType) ? activeType : (allowedTypes[0] ?? 'ENTRY')

  const canExit = canRegisterExit(permissions)

  // --- Quem está dentro (ficha da saída) ---
  const openAccessQuery = useOpenAccessQuery(
    open && step === 'context' && type === 'EXIT' && canExit ? searchedPlate : null,
  )

  /**
   * Cenário da solicitação que a entrada vai criar (regra 41).
   *
   * Derivado do contexto: veículo pela placa × condutor escolhido (novo ou já
   * cadastrado). É o `type` do bloco `request`.
   */
  const scenario: AccessRequestType = deriveRegistrationScenario({
    hasVehicle: !!context?.vehicle,
    isNewDriver,
  })

  // --- Formulário da exceção (schema depende do cenário derivado) ---
  const registrationSchema = useMemo(() => createAccessRegistrationSchema(scenario), [scenario])
  const registrationForm = useForm<AccessRegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: DEFAULT_REGISTRATION_VALUES,
  })

  // --- Pré-seleção do condutor sugerido pela ficha ---
  useEffect(() => {
    if (!context || type !== 'ENTRY' || driverUserId || isNewDriver) {
      return
    }
    const suggested =
      context.drivers.linked.find((driver) => driver.isPrimary && driver.canDrive) ??
      context.drivers.linked.find((driver) => driver.canDrive) ??
      context.drivers.linked[0]
    if (suggested) {
      setDriverUserId(suggested.id)
    }
  }, [context, type, driverUserId, isNewDriver])

  // --- Setor pré-selecionado com o padrão do veículo ---
  useEffect(() => {
    if (departmentId || !context) {
      return
    }
    const defaultId = context.department.defaultId ?? context.department.id
    if (defaultId) {
      setDepartmentId(defaultId)
    }
  }, [context, departmentId])

  const reset = useCallback(() => {
    setStep('plate')
    setPlateInput('')
    setPlateInvalid(false)
    setSearchedPlate(null)
    setSource(undefined)
    setExplicitType(null)
    setDriverUserId('')
    setDriverSearch('')
    setIsNewDriver(false)
    setDepartmentId(null)
    setPassenger('')
    setPassengerInvalid(false)
    setDenialReason(undefined)
    setDenialObservation('')
    setConfirm(null)
    setQrOpen(false)
    setEntryResult(null)
    setExitResult(null)
    setDenialResult(null)
    registrationForm.reset(DEFAULT_REGISTRATION_VALUES)
  }, [registrationForm])

  // Reset ao fechar (o `FormDialog` congela o conteúdo durante a animação).
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handlePlateSearch = (rawPlate?: string) => {
    const plate = normalizePlate(rawPlate ?? plateInput)
    if (!isValidBrazilianPlate(plate)) {
      setPlateInvalid(true)
      return
    }

    setPlateInvalid(false)
    setPlateInput(plate)
    setSearchedPlate(plate)
    setDriverUserId('')
    setPassenger('')
    setPassengerInvalid(false)
    setEntryResult(null)
    setExitResult(null)
    setDenialResult(null)
    setStep('context')
  }

  const handleStartDenial = (reason: EntryDenialReason) => {
    setExplicitType('DENIAL')
    setDenialReason(reason)
    // A negativa já diz o motivo na ficha: a observação sai pré-preenchida
    // com esse texto — inclusive quando o motivo sugerido tem texto próprio
    // (`BLOCKED`, `OVERDUE`) — e o porteiro só ajusta. Veredito que libera
    // (exceção "Não permitir") não tem texto de negativa: observação vazia.
    setDenialObservation(
      context && !isVerdictAllow(context.verdict)
        ? t(getVerdictLabelKey(context.verdict, context.reasons[0]))
        : '',
    )
  }

  const handleEntry = (overCapacity: boolean, requestBlock?: RegisterEntryRequestPayload) => {
    if (!context || !searchedPlate) {
      return
    }

    registerEntry.mutate(
      toRegisterEntryPayload(
        { plate: searchedPlate },
        {
          accessRequestId: requestBlock ? undefined : (context.reusableRequestId ?? undefined),
          request: requestBlock,
          driverUserId: isNewDriver ? undefined : driverUserId || undefined,
          departmentId: departmentId ?? undefined,
          entranceId: entranceId ?? undefined,
          overCapacity,
          source,
        },
      ),
      {
        onSuccess: (data) => {
          setEntryResult(data)
          setStep('result')
        },
      },
    )
  }

  /**
   * Bloco `request` da entrada, quando a exceção é necessária.
   *
   * @param values Valores validados do formulário da exceção.
   * @returns Bloco `request` ou `undefined` (entrada sem solicitação nova).
   */
  const buildRequestBlock = (
    values: AccessRegistrationFormValues,
  ): RegisterEntryRequestPayload | undefined => {
    if (!requestBlockNeeded) {
      return undefined
    }
    return toRegisterRequestBlock(values, { type: scenario, departmentId })
  }

  /**
   * Libera a entrada — validando os dados da exceção antes de enviar.
   *
   * O `handleSubmit` do RHF só bloqueia quando o cenário exige algo (ex.:
   * `NEW_USER` sem nome do condutor); em `LINK`/entrada normal o formulário não
   * tem campo obrigatório e segue direto.
   */
  const handleRelease = registrationForm.handleSubmit((values) => {
    if (!context) {
      return
    }
    // Exceção sem solicitação reaproveitável precisa do condutor escolhido.
    const needsDriverChoice = requestBlockNeeded && !isNewDriver && !driverUserId
    if (needsDriverChoice) {
      return
    }

    const requestBlock = buildRequestBlock(values)

    if (context.requiresOverCapacity) {
      pendingRelease.current = { request: requestBlock }
      setConfirm('overCapacity')
      return
    }
    if (context.isReentry) {
      pendingRelease.current = { request: requestBlock }
      setConfirm('reentry')
      return
    }
    handleEntry(false, requestBlock)
  })

  /**
   * Confirma a liberação pendente (vaga cheia ou reentrada).
   *
   * @param overCapacity Envia a confirmação de capacidade excedida.
   */
  const confirmRelease = (overCapacity: boolean) => {
    const pending = pendingRelease.current
    pendingRelease.current = null
    setConfirm(null)
    if (!pending) {
      return
    }
    handleEntry(overCapacity, pending.request)
  }

  const handleExit = () => {
    if (!searchedPlate) {
      return
    }
    const isNoExit = !context?.openAccesses.length
    const passengerRequired = isNoExit && !context?.vehicle?.freePass
    if (passengerRequired && !passenger.trim()) {
      setPassengerInvalid(true)
      return
    }

    registerExit.mutate(
      toRegisterExitPayload(
        { plate: searchedPlate, temporaryDriverName: isNoExit ? passenger.trim() : undefined },
        entranceId ?? undefined,
      ),
      {
        onSuccess: (data) => {
          setExitResult(data)
          setStep('result')
        },
      },
    )
  }

  const handleDenial = (values: AccessDenialFormValues) => {
    if (!searchedPlate) {
      return
    }

    registerDenial.mutate(
      toRegisterDenialPayload(
        {
          plate: searchedPlate,
          reason: values.reason,
          observation: values.observation || undefined,
          requestBlock: values.requestBlock,
          blockReason: values.blockReason || undefined,
        },
        {
          vehicleId: context?.vehicle?.id ?? null,
          entranceId: entranceId ?? null,
          blockId: context?.block?.id ?? null,
        },
      ),
      {
        onSuccess: (data) => {
          setDenialResult(data)
          setStep('result')
        },
      },
    )
  }

  const isPending = registerEntry.isPending || registerExit.isPending || registerDenial.isPending
  const openAccesses = openAccessQuery.data?.data ?? []
  const isNoExit = !context?.openAccesses.length
  const passengerRequired = isNoExit && !context?.vehicle?.freePass
  /**
   * A entrada precisa criar a solicitação junto (bloco `request`)?
   *
   * Sim quando o porteiro está **cadastrando** o condutor/veículo (exceção
   * pedida por ele) ou quando o veredito exige solicitação e não há uma aberta
   * para reaproveitar.
   */
  const requestBlockNeeded = needsRequestBlock({
    isNewDriver,
    requiresRequest: context?.requiresRequest,
    reusableRequestId: context?.reusableRequestId,
  })
  const needsDriver = requestBlockNeeded && !isNewDriver && !driverUserId
  /**
   * Pedir bloqueio exige `CREATE_BLOCK_REQUEST` (403 sem ela): o checkbox do
   * impedimento só aparece para quem pode pedir.
   */
  const canRequestBlockPermission = canRequestBlock(permissions)

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('register.title')}
        description={t('register.description')}
        size="2xl"
        fixedHeight
      >
        <div className="flex flex-col gap-5">
          {/* Passo da placa */}
          {step === 'plate' ? (
            <div className="space-y-2">
              <Label htmlFor="register-plate">{t('register.plate.label')}</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="register-plate"
                  value={plateInput}
                  onChange={(event) => setPlateInput(event.target.value.toUpperCase())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handlePlateSearch()
                    }
                  }}
                  placeholder={t('register.plate.placeholder')}
                  aria-invalid={plateInvalid}
                  className="uppercase sm:max-w-xs"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={() => handlePlateSearch()}
                  disabled={!plateInput.trim()}
                >
                  {t('register.plate.search')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setQrOpen(true)}>
                  {t('register.qr.label')}
                </Button>
              </div>
              {plateInvalid ? (
                <p className="text-destructive text-xs">{t('register.plate.invalid')}</p>
              ) : null}
            </div>
          ) : null}

          {/* Passo da ficha */}
          {step === 'context' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AccessPlateSummary plate={searchedPlate ?? ''} context={context} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('plate')}
                  disabled={isPending}
                >
                  {t('register.plate.change')}
                </Button>
              </div>

              {/* Tipo do registro (inferido, com escolha explícita) */}
              {allowedTypes.length > 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    {t('register.type.label')}
                  </span>
                  {allowedTypes.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={type === option ? 'default' : 'outline'}
                      aria-pressed={type === option}
                      onClick={() => {
                        setExplicitType(option)
                        if (option !== 'DENIAL') {
                          setDenialReason(undefined)
                        }
                      }}
                    >
                      {t(`register.type.${option}`)}
                    </Button>
                  ))}
                  {!explicitType ? (
                    <span className="text-muted-foreground text-xs">
                      {t('register.type.inferred')}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {contextQuery.isPending && !context ? (
                <p className="text-muted-foreground text-sm">{t('register.loading')}</p>
              ) : null}

              {contextQuery.isError ? (
                <p className="text-destructive text-sm">{t('register.error')}</p>
              ) : null}

              {context && type === 'ENTRY' ? (
                <div className="space-y-4">
                  <AccessVerdictCard context={context} />

                  {/* Setor confirmado (trocar refaz o contexto — regra 27) */}
                  <AccessDepartmentSelect
                    departments={departmentOptionsQuery.data ?? []}
                    value={departmentId}
                    onChange={setDepartmentId}
                    defaultDepartmentId={context.department.defaultId}
                    defaultDepartmentName={context.department.defaultName}
                    disabled={isPending}
                  />

                  {/* Quem vai dirigir: vinculados, sugestões (busca) ou novo */}
                  {context.vehicle?.freePass ? (
                    <p className="text-muted-foreground text-xs">
                      {t('verdict.reasons.ALLOW.FREE_PASS')}
                    </p>
                  ) : isNewDriver ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        className="text-primary text-xs font-medium underline-offset-2 hover:underline"
                        onClick={() => setIsNewDriver(false)}
                        disabled={isPending}
                      >
                        {t('register.driver.back')}
                      </button>
                      <AccessRegistrationFields
                        type={scenario}
                        register={registrationForm.register}
                        control={registrationForm.control}
                        errors={registrationForm.formState.errors}
                        requests={context.requests}
                        onPrefillFromRequest={(values) => {
                          if (values.driverName !== undefined) {
                            registrationForm.setValue('driverName', values.driverName)
                          }
                          if (values.driverEmail !== undefined) {
                            registrationForm.setValue('driverEmail', values.driverEmail)
                          }
                          if (values.driverDocument !== undefined) {
                            registrationForm.setValue('driverDocument', values.driverDocument)
                          }
                          if (values.driverPhone !== undefined) {
                            registrationForm.setValue('driverPhone', values.driverPhone)
                          }
                          if (values.contactPhone !== undefined) {
                            registrationForm.setValue('contactPhone', values.contactPhone)
                          }
                        }}
                        disabled={isPending}
                      />
                    </div>
                  ) : (
                    <AccessDriverPicker
                      linked={context.drivers.linked}
                      suggestions={context.drivers.suggestions}
                      value={driverUserId}
                      onChange={setDriverUserId}
                      search={driverSearch}
                      onSearchChange={setDriverSearch}
                      isPending={contextQuery.isFetching}
                      onNewDriver={() => setIsNewDriver(true)}
                    />
                  )}

                  {/* O que a entrada vai criar/registrar */}
                  {context.requiresRequest && !context.reusableRequestId ? (
                    <p className="text-muted-foreground text-xs">{t('register.request.create')}</p>
                  ) : null}
                  {context.reusableRequestId && !isNewDriver ? (
                    <p className="text-muted-foreground text-xs">{t('register.request.reuse')}</p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleRelease}
                      disabled={isPending || needsDriver}
                    >
                      {isPending ? t('register.actions.submitting') : t('register.actions.release')}
                    </Button>
                    {/* Negativa: o caminho é registrar o impedimento. */}
                    {!isVerdictAllow(context.verdict) && allowedTypes.includes('DENIAL') ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleStartDenial(denialReasonFromVerdict(context.verdict))}
                        disabled={isPending}
                      >
                        {t('register.actions.denial')}
                      </Button>
                    ) : null}
                    {needsDriver ? (
                      <span className="text-xs text-amber-600">
                        {t('register.request.blocked')}
                      </span>
                    ) : null}
                    {/* Exceção: o porteiro também pode simplesmente não permitir */}
                    {allowedTypes.includes('DENIAL') && context.requiresRequest ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleStartDenial('UNAUTHORIZED_DRIVER')}
                        disabled={isPending}
                      >
                        {t('register.actions.refuse')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {context && type === 'EXIT' ? (
                <div className="space-y-4">
                  {openAccessQuery.isPending ? (
                    <p className="text-muted-foreground text-sm">{t('register.loading')}</p>
                  ) : null}

                  {openAccesses.length > 0 ? (
                    <ul className="space-y-2">
                      {openAccesses.map((openAccess) => (
                        <li key={openAccess.id} className="rounded-md border p-3 text-sm">
                          <p className="font-medium">
                            {openAccess.driver.name ?? '—'}
                            {openAccess.driver.phone ? (
                              <span className="text-muted-foreground">
                                {' '}
                                · {openAccess.driver.phone}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {t('register.exit.open', { date: openAccess.entryAt ?? '—' })}
                            {openAccess.departmentName ? ` · ${openAccess.departmentName}` : ''}
                            {openAccess.vehicle?.model ? ` · ${openAccess.vehicle.model}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {isNoExit && !openAccessQuery.isPending ? (
                    <p className="text-sm text-amber-600">{t('register.exit.noExit')}</p>
                  ) : null}

                  {passengerRequired ? (
                    <div className="space-y-2">
                      <Label htmlFor="register-passenger">
                        {t('register.exit.passenger.label')}
                      </Label>
                      <Input
                        id="register-passenger"
                        value={passenger}
                        onChange={(event) => setPassenger(event.target.value)}
                        placeholder={t('register.exit.passenger.placeholder')}
                        aria-invalid={passengerInvalid}
                      />
                      {passengerInvalid ? (
                        <p className="text-destructive text-xs">
                          {t('register.exit.passenger.required')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={handleExit} disabled={isPending}>
                      {isPending ? t('register.actions.submitting') : t('register.actions.exit')}
                    </Button>
                    {allowedTypes.includes('DENIAL') ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleStartDenial('UNAUTHORIZED_DRIVER')}
                        disabled={isPending}
                      >
                        {t('register.actions.denial')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {context && type === 'DENIAL' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">{t('register.denial.title')}</p>
                  <AccessDenialForm
                    key={denialReason ?? 'default'}
                    initialReason={denialReason}
                    initialObservation={denialObservation}
                    canRequestBlock={canRequestBlockPermission}
                    onSubmit={handleDenial}
                    isPending={isPending}
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {/* Passo do resultado */}
          {step === 'result' ? (
            <AccessResultCard
              entry={entryResult}
              exit={exitResult}
              denial={denialResult}
              departmentName={context?.department.name ?? null}
              onRegisterAnother={reset}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </div>
      </FormDialog>

      {/* Ler QR (preenche a placa) */}
      <QrResolveDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        onResolved={(vehicle) => {
          setSource('QRCODE')
          handlePlateSearch(vehicle.plate)
        }}
      />

      {/* Vaga cheia: confirmação antes de enviar `overCapacity` */}
      <ConfirmDialog
        open={confirm === 'overCapacity'}
        onOpenChange={(next) => !next && setConfirm(null)}
        title={t('register.confirm.overCapacity.title')}
        description={t('register.confirm.overCapacity.description')}
        confirmLabel={t('register.confirm.overCapacity.confirm')}
        cancelLabel={t('notifications.over-capacity-cancel')}
        onConfirm={() => confirmRelease(true)}
        isPending={registerEntry.isPending}
        variant="default"
      />

      {/* Reentrada: a entrada anterior será encerrada */}
      <ConfirmDialog
        open={confirm === 'reentry'}
        onOpenChange={(next) => !next && setConfirm(null)}
        title={t('register.confirm.reentry.title')}
        description={t('register.confirm.reentry.description', { plate: searchedPlate ?? '' })}
        confirmLabel={t('register.confirm.reentry.confirm')}
        cancelLabel={t('register.actions.close')}
        onConfirm={() => confirmRelease(false)}
        isPending={registerEntry.isPending}
        variant="default"
      />
    </>
  )
}
