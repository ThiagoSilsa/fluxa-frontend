// React
import { useEffect } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { revokeBlockSchema } from '../schemas/block.schema'

// Types
import type { RevokeBlockValues } from '../schemas/block.schema'

// Shared
import { Button, FormDialog, Label, Textarea } from '#/shared/components'

export type BlockRevokeDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Placa do veículo bloqueado (exibida na descrição). */
  plate: string
  /** Desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Callback de submit com o motivo validado. */
  onSubmit: (values: RevokeBlockValues) => void
}

const DEFAULT_VALUES: RevokeBlockValues = { reason: '' }

/**
 * Dialog de revogação de bloqueio (motivo obrigatório — MANAGE_BLOCKS).
 */
export function BlockRevokeDialog({
  open,
  onOpenChange,
  plate,
  isSubmitting,
  onSubmit,
}: BlockRevokeDialogProps) {
  const { t } = useTranslation('blocks')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevokeBlockValues>({
    resolver: zodResolver(revokeBlockSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // Reinicia o formulário ao abrir.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('revoke.title')}
      description={t('revoke.description', { plate })}
      size="lg"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="revoke-reason">
            {t('form.reason.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Textarea
            id="revoke-reason"
            {...register('reason')}
            aria-invalid={!!errors.reason}
            placeholder={t('form.reason.placeholder')}
            rows={3}
          />
          {errors.reason?.message ? (
            <p className="text-destructive text-xs">{t(errors.reason.message)}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('revoke.submitting') : t('revoke.submit')}
        </Button>
      </form>
    </FormDialog>
  )
}
