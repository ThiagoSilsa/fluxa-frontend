// React
import { useEffect } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { blockFormSchema } from '../schemas/block.schema'

// Types
import type { BlockFormValues } from '../schemas/block.schema'

// Shared
import { Button, FormDialog, PlateReasonFields } from '#/shared/components'

export type BlockCreateDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo: criação de bloqueio ou de solicitação de bloqueio. */
  mode: 'block' | 'request'
  /** Desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Callback de submit com os valores validados. */
  onSubmit: (values: BlockFormValues) => void
}

const DEFAULT_VALUES: BlockFormValues = { plate: '', reason: '' }

/**
 * Dialog de criação de bloqueio (`mode='block'` — MANAGE_BLOCKS) ou de
 * solicitação de bloqueio (`mode='request'` — porteiro). Ambos enviam
 * placa + motivo.
 */
export function BlockCreateDialog({
  open,
  onOpenChange,
  mode,
  isSubmitting,
  onSubmit,
}: BlockCreateDialogProps) {
  const { t } = useTranslation('blocks')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // Reinicia o formulário ao abrir.
  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  const isBlock = mode === 'block'

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isBlock ? t('createBlock.title') : t('createRequest.title')}
      description={isBlock ? t('createBlock.description') : t('createRequest.description')}
      size="lg"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <PlateReasonFields
          idPrefix="block"
          register={register}
          errors={errors}
          translateError={(key) => (key ? t(key) : '')}
          texts={{
            plateLabel: t('form.plate.label'),
            platePlaceholder: t('form.plate.placeholder'),
            reasonLabel: t('form.reason.label'),
            reasonPlaceholder: t('form.reason.placeholder'),
          }}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? isBlock
              ? t('createBlock.submitting')
              : t('createRequest.submitting')
            : isBlock
              ? t('createBlock.submit')
              : t('createRequest.submit')}
        </Button>
      </form>
    </FormDialog>
  )
}
