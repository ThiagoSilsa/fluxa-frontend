// React Hook Form
import { Controller } from 'react-hook-form'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import type { AccessRegistrationFormValues } from '../schemas/access-registration.schema'
import type { AccessContextRequest, AccessRequestType } from '../types/access.types'

// Shared
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

export type AccessRegistrationFieldsProps = {
  /** Cenário derivado (decide quais campos aparecem). */
  type: AccessRequestType
  /** Registro do RHF (o formulário é do modal). */
  register: UseFormRegister<AccessRegistrationFormValues>
  /** Controle do RHF (campos em `Select`). */
  control: Control<AccessRegistrationFormValues>
  /** Erros do RHF (mensagens são chaves i18n). */
  errors: FieldErrors<AccessRegistrationFormValues>
  /** Solicitações da placa — preenchem o formulário ao escolher uma. */
  requests: AccessContextRequest[]
  /** Pré-preenche o formulário a partir de uma solicitação da placa. */
  onPrefillFromRequest: (values: Partial<AccessRegistrationFormValues>) => void
  /** Desabilita os campos enquanto a entrada está sendo registrada. */
  disabled?: boolean
}

/**
 * Campos da **exceção** registrada na portaria (regra 41).
 *
 * Só aparece o que o cenário precisa — condutor novo (`NEW_USER`/`BOTH`),
 * veículo novo (`NEW_VEHICLE`/`BOTH`), e o telefone de contato em todos menos
 * `LINK`. O formulário em si (RHF + schema por cenário) é do modal, para o
 * botão de liberar validar tudo de uma vez.
 */
export function AccessRegistrationFields({
  type,
  register,
  control,
  errors,
  requests,
  onPrefillFromRequest,
  disabled = false,
}: AccessRegistrationFieldsProps) {
  const { t } = useTranslation('access')

  const createsDriver = type === 'NEW_USER' || type === 'BOTH'
  const createsVehicle = type === 'NEW_VEHICLE' || type === 'BOTH'
  const needsContact = type !== 'LINK'
  const errorMessage = (key: string | undefined) => (key ? t(key) : '')

  /**
   * Pré-preenche o formulário com os dados de uma solicitação da placa.
   *
   * O bloco `requests` do contexto é enxuto (não traz o `payload`): o que dá
   * para aproveitar é o nome informado na solicitação — o resto o porteiro
   * completa no balcão.
   *
   * @param requestId Id da solicitação escolhida.
   */
  const handlePrefill = (requestId: string) => {
    const request = requests.find((item) => item.id === requestId)
    if (!request) {
      return
    }

    onPrefillFromRequest({ driverName: request.driverName ?? '' })
  }

  return (
    <div className="space-y-4 rounded-lg border p-3">
      {/* Ponto de partida: uma solicitação já aberta para a placa */}
      {createsDriver && requests.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="registration-request">{t('register.newDriver.fromRequest.label')}</Label>
          <Select value="" onValueChange={handlePrefill} disabled={disabled}>
            <SelectTrigger id="registration-request" className="w-full">
              <SelectValue placeholder={t('register.newDriver.fromRequest.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {requests.map((request) => (
                <SelectItem key={request.id} value={request.id}>
                  {request.driverName ?? t('register.newDriver.fromRequest.unknown')}
                  {' · '}
                  {t(`verdict.requests.status.${request.status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {createsDriver ? (
        <>
          <p className="text-sm font-medium">{t('register.newDriver.driverTitle')}</p>

          <div className="space-y-2">
            <Label htmlFor="registration-user-type">{t('register.newDriver.userType.label')}</Label>
            <Controller
              control={control}
              name="userType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger id="registration-user-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISITOR">
                      {t('register.newDriver.userType.VISITOR')}
                    </SelectItem>
                    <SelectItem value="EMPLOYEE">
                      {t('register.newDriver.userType.EMPLOYEE')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-driver-name">{t('register.newDriver.name.label')}</Label>
            <Input
              id="registration-driver-name"
              placeholder={t('register.newDriver.name.placeholder')}
              aria-invalid={!!errors.driverName}
              disabled={disabled}
              {...register('driverName')}
            />
            {errors.driverName ? (
              <p className="text-destructive text-xs">{errorMessage(errors.driverName.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registration-driver-phone">
                {t('register.newDriver.phone.label')}
              </Label>
              <Input
                id="registration-driver-phone"
                placeholder={t('register.newDriver.phone.placeholder')}
                disabled={disabled}
                {...register('driverPhone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration-driver-document">
                {t('register.newDriver.document.label')}
              </Label>
              <Input
                id="registration-driver-document"
                placeholder={t('register.newDriver.document.placeholder')}
                disabled={disabled}
                {...register('driverDocument')}
              />
            </div>
          </div>

          {/* E-mail é obrigatório só para Colaborador (ADR 0013) */}
          <div className="space-y-2">
            <Label htmlFor="registration-driver-email">{t('register.newDriver.email.label')}</Label>
            <Input
              id="registration-driver-email"
              type="email"
              placeholder={t('register.newDriver.email.placeholder')}
              aria-invalid={!!errors.driverEmail}
              disabled={disabled}
              {...register('driverEmail')}
            />
            {errors.driverEmail ? (
              <p className="text-destructive text-xs">{errorMessage(errors.driverEmail.message)}</p>
            ) : null}
          </div>
        </>
      ) : null}

      {createsVehicle ? (
        <>
          <p className="text-sm font-medium">{t('register.newDriver.vehicleTitle')}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registration-vehicle-model">
                {t('register.newDriver.model.label')}
              </Label>
              <Input
                id="registration-vehicle-model"
                placeholder={t('register.newDriver.model.placeholder')}
                aria-invalid={!!errors.vehicleModel}
                disabled={disabled}
                {...register('vehicleModel')}
              />
              {errors.vehicleModel ? (
                <p className="text-destructive text-xs">
                  {errorMessage(errors.vehicleModel.message)}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration-vehicle-color">
                {t('register.newDriver.color.label')}
              </Label>
              <Input
                id="registration-vehicle-color"
                placeholder={t('register.newDriver.color.placeholder')}
                disabled={disabled}
                {...register('vehicleColor')}
              />
            </div>
          </div>
        </>
      ) : null}

      {needsContact ? (
        <div className="space-y-2">
          <Label htmlFor="registration-contact-phone">
            {t('register.newDriver.contactPhone.label')}
          </Label>
          <Input
            id="registration-contact-phone"
            placeholder={t('register.newDriver.contactPhone.placeholder')}
            aria-invalid={!!errors.contactPhone}
            disabled={disabled}
            {...register('contactPhone')}
          />
          {errors.contactPhone ? (
            <p className="text-destructive text-xs">{errorMessage(errors.contactPhone.message)}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
