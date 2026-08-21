// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { entranceFormSchema } from '../schemas/entrance.schema'

// Mappers
import { normalizeEntranceFormDefaults } from '../mappers/entrance.mapper'

// Types
import type { EntranceEntity } from '../types/entrances.types'
import type { EntranceFormValues } from '../schemas/entrance.schema'

// Components
import { Button, FormDialog, Input, Label, Switch } from '#/shared/components'

export type EntranceFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Portaria em edição (modo edição). */
  entrance?: EntranceEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Callback de submit com os valores validados. */
  onSubmit: (values: EntranceFormValues) => void
}

/**
 * Dialog de formulário de portaria (criação/edição).
 *
 * Campos: nome (obrigatório) e status (Switch ativo/inativo). Na criação o
 * Switch de status aparece desabilitado com aviso de que a portaria já nasce
 * ativa; na edição ativa/desativa via PATCH (`isActive`).
 */
export function EntranceFormDialog({
  open,
  onOpenChange,
  mode,
  entrance,
  isSubmitting,
  submitLabel,
  onSubmit,
}: EntranceFormDialogProps) {
  const { t } = useTranslation('entrances')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EntranceFormValues>({
    resolver: zodResolver(entranceFormSchema),
    defaultValues: normalizeEntranceFormDefaults(entrance),
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('dialog.create.title') : t('dialog.edit.title')}
      description={
        mode === 'create' ? t('dialog.create.description') : t('dialog.edit.description')
      }
      size="lg"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="entrance-name">
            {t('form.name.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="entrance-name"
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder={t('form.name.placeholder')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{t(errors.name.message)}</p>
          ) : null}
        </div>

        {/* Status — Switch (ativo/inativo) */}
        <div className="space-y-2">
          <Label>{t('form.status.label')}</Label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mode === 'create'}
                  aria-label={t('form.status.label')}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {field.value ? t('status.active') : t('status.inactive')}
                  </div>
                  {mode === 'create' ? (
                    <p className="text-muted-foreground text-xs">{t('form.status.create-hint')}</p>
                  ) : null}
                </div>
              </div>
            )}
          />
        </div>

        <div className="border-border flex shrink-0 flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? t('form.submitting') : submitLabel}
          </Button>
        </div>
      </form>
    </FormDialog>
  )
}
