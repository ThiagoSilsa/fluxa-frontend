// React
import { useEffect } from 'react'

// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { accessRequestFormSchema } from '../schemas/access-request.schema'

// Components
import { UserPicker } from './user-picker'
import { VehiclePicker } from './vehicle-picker'

// Types
import type { AccessRequestFormValues } from '../schemas/access-request.schema'
import type { AccessRequestType } from '../types/access-requests.types'

// Shared
import {
  Button,
  FormDialog,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

export type AccessRequestCreateDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Desabilita o submit enquanto a criação está pendente. */
  isSubmitting: boolean
  /** Callback de submit com os valores validados. */
  onSubmit: (values: AccessRequestFormValues) => void
}

const REQUEST_TYPES: AccessRequestType[] = ['NEW_USER', 'NEW_VEHICLE', 'LINK', 'BOTH']

const DEFAULT_VALUES: AccessRequestFormValues = {
  type: 'NEW_USER',
  plate: '',
  vehicleId: '',
  userId: '',
  contactChannel: 'WHATSAPP',
  contactPhone: '',
  driverName: '',
  driverEmail: '',
  driverDocument: '',
  driverPhone: '',
  vehicleModel: '',
  vehicleColor: '',
}

/**
 * Dialog de criação de solicitação de acesso (porteiro).
 *
 * Formulário com os 4 cenários (regra 41): os campos exibidos dependem do
 * tipo escolhido — veículo/usuário existentes via seletores de busca
 * (NEW_USER/NEW_VEHICLE/LINK) e dados de motorista/veículo a criar
 * (NEW_USER/NEW_VEHICLE/BOTH), sempre com telefone de contato quando há
 * cadastro a criar.
 */
export function AccessRequestCreateDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: AccessRequestCreateDialogProps) {
  const { t } = useTranslation('accessRequests')

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const type = watch('type')

  // Reinicia o formulário ao abrir.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  const handleTypeChange = (value: AccessRequestType) => {
    setValue('type', value)
    // Limpa as seleções de cenários anteriores (evita validação velha).
    setValue('vehicleId', '')
    setValue('userId', '')
  }

  const showVehiclePicker = type === 'NEW_USER' || type === 'LINK'
  const showUserPicker = type === 'NEW_VEHICLE' || type === 'LINK'
  const showDriverData = type === 'NEW_USER' || type === 'BOTH'
  const showVehicleData = type === 'NEW_VEHICLE' || type === 'BOTH'
  const showContact = type !== 'LINK'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('create.title')}
      description={t('create.description')}
      size="2xl"
      fixedHeight
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Cenário */}
        <div className="space-y-2">
          <Label>{t('create.type.label')}</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  handleTypeChange(value as AccessRequestType)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((requestType) => (
                    <SelectItem key={requestType} value={requestType}>
                      {t(`type.${requestType}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Placa */}
        <div className="space-y-2">
          <Label htmlFor="ar-plate">
            {t('create.plate.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="ar-plate"
            {...register('plate')}
            aria-invalid={!!errors.plate}
            placeholder={t('create.plate.placeholder')}
            className="uppercase"
            maxLength={10}
          />
          {errors.plate?.message ? (
            <p className="text-destructive text-xs">{t(errors.plate.message)}</p>
          ) : null}
        </div>

        {/* Veículo existente */}
        {showVehiclePicker ? (
          <div className="space-y-2">
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => (
                <VehiclePicker value={field.value ?? ''} onChange={field.onChange} />
              )}
            />
            {errors.vehicleId?.message ? (
              <p className="text-destructive text-xs">{t(errors.vehicleId.message)}</p>
            ) : null}
          </div>
        ) : null}

        {/* Usuário existente */}
        {showUserPicker ? (
          <div className="space-y-2">
            <Controller
              control={control}
              name="userId"
              render={({ field }) => (
                <UserPicker value={field.value ?? ''} onChange={field.onChange} />
              )}
            />
            {errors.userId?.message ? (
              <p className="text-destructive text-xs">{t(errors.userId.message)}</p>
            ) : null}
          </div>
        ) : null}

        {/* Contato (quando há cadastro a criar) */}
        {showContact ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('create.contactChannel.label')}</Label>
              <Controller
                control={control}
                name="contactChannel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="EMAIL">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar-contact-phone">
                {t('create.contactPhone.label')}
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                id="ar-contact-phone"
                {...register('contactPhone')}
                aria-invalid={!!errors.contactPhone}
                placeholder={t('create.contactPhone.placeholder')}
              />
              {errors.contactPhone?.message ? (
                <p className="text-destructive text-xs">{t(errors.contactPhone.message)}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Motorista a criar */}
        {showDriverData ? (
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">{t('create.driver.title')}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ar-driver-name">
                  {t('create.driver.name.label')}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="ar-driver-name"
                  {...register('driverName')}
                  aria-invalid={!!errors.driverName}
                  placeholder={t('create.driver.name.placeholder')}
                />
                {errors.driverName?.message ? (
                  <p className="text-destructive text-xs">{t(errors.driverName.message)}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ar-driver-email">
                  {t('create.driver.email.label')}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="ar-driver-email"
                  {...register('driverEmail')}
                  aria-invalid={!!errors.driverEmail}
                  placeholder={t('create.driver.email.placeholder')}
                />
                {errors.driverEmail?.message ? (
                  <p className="text-destructive text-xs">{t(errors.driverEmail.message)}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ar-driver-document">{t('create.driver.document.label')}</Label>
                <Input
                  id="ar-driver-document"
                  {...register('driverDocument')}
                  placeholder={t('create.driver.document.placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ar-driver-phone">{t('create.driver.phone.label')}</Label>
                <Input
                  id="ar-driver-phone"
                  {...register('driverPhone')}
                  placeholder={t('create.driver.phone.placeholder')}
                />
              </div>
            </div>
          </fieldset>
        ) : null}

        {/* Veículo a criar */}
        {showVehicleData ? (
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">{t('create.vehicleData.title')}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ar-vehicle-model">
                  {t('create.vehicleData.model.label')}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="ar-vehicle-model"
                  {...register('vehicleModel')}
                  aria-invalid={!!errors.vehicleModel}
                  placeholder={t('create.vehicleData.model.placeholder')}
                />
                {errors.vehicleModel?.message ? (
                  <p className="text-destructive text-xs">{t(errors.vehicleModel.message)}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ar-vehicle-color">{t('create.vehicleData.color.label')}</Label>
                <Input
                  id="ar-vehicle-color"
                  {...register('vehicleColor')}
                  placeholder={t('create.vehicleData.color.placeholder')}
                />
              </div>
            </div>
          </fieldset>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('create.submitting') : t('create.submit')}
        </Button>
      </form>
    </FormDialog>
  )
}
