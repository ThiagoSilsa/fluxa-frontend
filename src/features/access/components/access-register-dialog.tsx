// React
import { useCallback, useEffect, useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Components
import { AccessDenialForm } from './access-denial-form'
import { AccessDriverSelect } from './access-driver-select'
import { AccessResultCard } from './access-result-card'
import { AccessPlateSummary, AccessVerdictCard } from './access-verdict-card'
import { QrResolveDialog } from './qr-resolve-dialog'

// Hooks
import { useAccessContextQuery } from '../hooks/use-access-context-query'
import { useAccessMutations } from '../hooks/use-access-mutations'
import { useOpenAccessQuery } from '../hooks/use-open-access-query'

// Lib
import {
  canRegisterDenial,
  canRegisterEntry,
  canRegisterExit,
  getVerdictLabelKey,
} from '../lib/access.lib'

// Mappers
import {
  toRegisterDenialPayload,
  toRegisterEntryPayload,
  toRegisterExitPayload,
} from '../mappers/access.mapper'

// Types
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
  const [passenger, setPassenger] = useState('')
  const [passengerInvalid, setPassengerInvalid] = useState(false)
  const [denialReason, setDenialReason] = useState<EntryDenialReason | undefined>(undefined)
  const [denialObservation, setDenialObservation] = useState('')
  const [confirm, setConfirm] = useState<'overCapacity' | 'reentry' | null>(null)
  const [qrOpen, setQrOpen] = useState(false)

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

  // --- Ficha da placa (contexto + veredito) ---
  const contextQuery = useAccessContextQuery(
    open && searchedPlate ? { plate: searchedPlate } : null,
  )
  const context: AccessContextResponse | null = contextQuery.data ?? null

  // --- Inferência do tipo (a escolha explícita sempre vence) ---
  const inferredType: RegisterType = context?.openAccesses.length ? 'EXIT' : 'ENTRY'
  const activeType = explicitType ?? inferredType
  const type = allowedTypes.includes(activeType) ? activeType : (allowedTypes[0] ?? 'ENTRY')

  const canExit = canRegisterExit(permissions)

  // --- Quem está dentro (ficha da saída) ---
  const openAccessQuery = useOpenAccessQuery(
    open && step === 'context' && type === 'EXIT' && canExit ? searchedPlate : null,
  )

  // --- Pré-seleção do condutor sugerido pela ficha ---
  useEffect(() => {
    if (!context || type !== 'ENTRY' || driverUserId) {
      return
    }
    const suggested =
      context.drivers.linked.find((driver) => driver.isPrimary && driver.canDrive) ??
      context.drivers.linked.find((driver) => driver.canDrive) ??
      context.drivers.linked[0]
    if (suggested) {
      setDriverUserId(suggested.id)
    }
  }, [context, type, driverUserId])

  const reset = useCallback(() => {
    setStep('plate')
    setPlateInput('')
    setPlateInvalid(false)
    setSearchedPlate(null)
    setSource(undefined)
    setExplicitType(null)
    setDriverUserId('')
    setPassenger('')
    setPassengerInvalid(false)
    setDenialReason(undefined)
    setDenialObservation('')
    setConfirm(null)
    setQrOpen(false)
    setEntryResult(null)
    setExitResult(null)
    setDenialResult(null)
  }, [])

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
    // Sem motivo próprio (`INACTIVE`, placa desconhecida) o motivo vira
    // "outro" — e a observação (obrigatória nesse caso) já sai preenchida com
    // o texto da negativa, para o porteiro só ajustar.
    setDenialObservation(
      reason === 'OTHER' && context
        ? t(getVerdictLabelKey(context.verdict, context.reasons[0]))
        : '',
    )
  }

  const handleEntry = (overCapacity: boolean) => {
    if (!context || !searchedPlate) {
      return
    }

    registerEntry.mutate(
      toRegisterEntryPayload(
        { plate: searchedPlate },
        {
          accessRequestId: context.reusableRequestId ?? undefined,
          request: buildRequestBlock(context),
          driverUserId: driverUserId || undefined,
          departmentId: context.department.id ?? undefined,
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

  const handleRelease = () => {
    if (!context) {
      return
    }
    // Exceção sem solicitação reaproveitável precisa do condutor escolhido.
    if (needsRequestBlock(context) && !driverUserId) {
      return
    }
    if (context.requiresOverCapacity) {
      setConfirm('overCapacity')
      return
    }
    if (context.isReentry) {
      setConfirm('reentry')
      return
    }
    handleEntry(false)
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

  const handleDenial = (values: { reason: EntryDenialReason; observation: string }) => {
    if (!searchedPlate) {
      return
    }

    registerDenial.mutate(
      toRegisterDenialPayload(
        {
          plate: searchedPlate,
          reason: values.reason,
          observation: values.observation || undefined,
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
  const needsDriver = !!context && needsRequestBlock(context) && !driverUserId

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

                  {/* Exceção: quem vai dirigir */}
                  {context.vehicle?.freePass ? (
                    <p className="text-muted-foreground text-xs">
                      {t('verdict.reasons.ALLOW.FREE_PASS')}
                    </p>
                  ) : context.drivers.linked.length === 0 &&
                    context.drivers.suggestions.length === 0 ? (
                    <p className="text-muted-foreground text-xs">{t('register.driver.empty')}</p>
                  ) : (
                    <div className="space-y-1">
                      <AccessDriverSelect
                        drivers={[...context.drivers.linked, ...context.drivers.suggestions]}
                        value={driverUserId}
                        onChange={setDriverUserId}
                        disabled={isPending}
                      />
                      {context.requiresRequest ? (
                        <p className="text-muted-foreground text-xs">
                          {context.reusableRequestId
                            ? t('register.request.reuse')
                            : t('register.request.create')}
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleRelease}
                      disabled={isPending || needsDriver}
                    >
                      {isPending ? t('register.actions.submitting') : t('register.actions.release')}
                    </Button>
                    {/* Negativa: o caminho é registrar o impedimento. */}
                    {!isAllow(context.verdict) && allowedTypes.includes('DENIAL') ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleStartDenial(denialReasonFromVerdict(context))}
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
        onConfirm={() => {
          setConfirm(null)
          handleEntry(true)
        }}
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
        onConfirm={() => {
          setConfirm(null)
          handleEntry(false)
        }}
        isPending={registerEntry.isPending}
        variant="default"
      />
    </>
  )
}

/**
 * Veredito que libera a entrada?
 *
 * @param verdict Veredito do contexto.
 * @returns `true` para os `ALLOW_*`.
 */
function isAllow(verdict: AccessContextResponse['verdict']): boolean {
  return verdict.startsWith('ALLOW')
}

/**
 * A entrada precisa criar a solicitação junto (exceção sem solicitação aberta)?
 *
 * @param context Ficha da placa.
 * @returns `true` quando o payload precisa do bloco `request`.
 */
function needsRequestBlock(context: AccessContextResponse | null): boolean {
  return !!context?.requiresRequest && !context.reusableRequestId
}

/**
 * Bloco `request` da exceção registrada na portaria.
 *
 * O cenário é derivado do que existe: veículo cadastrado + condutor escolhido
 * sem vínculo é o `LINK` (a regra 41 manda o porteiro liberar na hora). Os
 * cenários que exigem **cadastrar** alguém (motorista novo, veículo novo,
 * ambos) entram com o sub-formulário do ticket 04 — que também assume a
 * derivação completa do tipo.
 *
 * @param context Ficha da placa.
 * @returns Bloco `request` ou `undefined` quando não é exceção.
 */
function buildRequestBlock(
  context: AccessContextResponse | null,
): RegisterEntryRequestPayload | undefined {
  if (!context || !needsRequestBlock(context)) {
    return undefined
  }

  const type: AccessRequestType = context.vehicle ? 'LINK' : 'NEW_VEHICLE'
  return {
    type,
    departmentId: context.department.id ?? undefined,
  }
}

/**
 * Motivo de impedimento sugerido pela negativa do veredito.
 *
 * `DENY_BLOCKED` e `DENY_OVERDUE` têm motivo próprio; os demais (veículo
 * inativo, placa desconhecida) caem em `OTHER`, cuja observação é obrigatória.
 *
 * @param context Ficha da placa.
 * @returns Motivo do impedimento.
 */
function denialReasonFromVerdict(context: AccessContextResponse): EntryDenialReason {
  if (context.verdict === 'DENY_BLOCKED') {
    return 'BLOCKED'
  }
  if (context.verdict === 'DENY_OVERDUE') {
    return 'OVERDUE'
  }
  return 'OTHER'
}
