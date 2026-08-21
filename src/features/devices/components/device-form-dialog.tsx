// React
import { Controller, useForm } from 'react-hook-form'

// Zod
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { deviceFormSchema } from '../schemas/device.schema'
import type { DeviceFormValues } from '../schemas/device.schema'

// Mappers
import { normalizeDeviceFormDefaults } from '../mappers/device.mapper'

// Types
import type { DeviceEntity, DeviceParameterOption } from '../types/devices.types'

// Components
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
  Switch,
} from '#/shared/components'

export type DeviceFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Dispositivo em edição (modo edição). */
  device?: DeviceEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Portarias ativas (do `parameters` da listagem). */
  entranceOptions: DeviceParameterOption[]
  /** Callback de submit com os valores validados. */
  onSubmit: (values: DeviceFormValues) => void
}

/**
 * Dialog de formulário de dispositivo (criação/edição).
 *
 * Campos: nome (obrigatório), plataforma (obrigatória na criação e **imutável**
 * na edição — desabilitada, ADR 0008 §7), portaria vinculada (opcional, ativa
 * da empresa) e status (Switch ativo/inativo, desabilitado na criação).
 */
export function DeviceFormDialog({
  open,
  onOpenChange,
  mode,
  device,
  isSubmitting,
  submitLabel,
  entranceOptions,
  onSubmit,
}: DeviceFormDialogProps) {
  const { t } = useTranslation('devices')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: normalizeDeviceFormDefaults(device),
  })

  const isActive = watch('isActive')

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('dialog.create.title') : t('dialog.edit.title')}
      description={
        mode === 'create' ? t('dialog.create.description') : t('dialog.edit.description')
      }
      size="md"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="device-name">
            {t('form.name.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="device-name"
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder={t('form.name.placeholder')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{t(errors.name.message)}</p>
          ) : null}
        </div>

        {/* Plataforma — imutável na edição */}
        <div className="space-y-2">
          <Label htmlFor="device-platform">
            {t('form.platform.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Controller
            control={control}
            name="platform"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={mode === 'edit'}>
                <SelectTrigger id="device-platform" className="w-full" disabled={mode === 'edit'}>
                  <SelectValue placeholder={t('form.platform.placeholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ANDROID">Android</SelectItem>
                  <SelectItem value="IOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {mode === 'edit' ? (
            <p className="text-muted-foreground text-xs">{t('form.platform.immutable-hint')}</p>
          ) : null}
          {errors.platform?.message ? (
            <p className="text-destructive text-xs">{t(errors.platform.message)}</p>
          ) : null}
        </div>

        {/* Portaria vinculada */}
        <div className="space-y-2">
          <Label htmlFor="device-entrance">{t('form.entrance.label')}</Label>
          <Controller
            control={control}
            name="entranceId"
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
              >
                <SelectTrigger id="device-entrance" className="w-full">
                  <SelectValue placeholder={t('form.entrance.placeholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">{t('form.entrance.none')}</SelectItem>
                  {entranceOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-muted-foreground text-xs">{t('form.entrance.hint')}</p>
        </div>

        {/* Status — somente edição */}
        {mode === 'edit' ? (
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="device-active">{t('form.status.label')}</Label>
              <p className="text-muted-foreground text-xs">
                {isActive ? t('form.status.active-hint') : t('form.status.inactive-hint')}
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch id="device-active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('form.submitting') : submitLabel}
          </Button>
        </div>
      </form>
    </FormDialog>
  )
}
