// React
import { useState } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { QrCode } from 'lucide-react'

// Schemas
import { entryFormSchema } from '../schemas/portaria.schema'

// Components
import { QrResolveDialog } from './qr-resolve-dialog'

// Types
import type { EntryFormValues } from '../schemas/portaria.schema'
import type { ResolvedVehicleQr } from '../types/access.types'

// Shared
import { Button, Input, Label } from '#/shared/components'

export type PortariaEntryFormProps = {
  /** Desabilita o submit enquanto a entrada está pendente. */
  isPending: boolean
  /** Callback de submit com os valores validados. */
  onSubmit: (values: EntryFormValues) => void
}

/**
 * Formulário de entrada da portaria.
 *
 * Campos: placa (obrigatória — formato BR validado, uppercase), solicitação
 * autorizada (ID opcional — ADR 0010 §4) e condutor temporário. Botão "Ler
 * QR" resolve o código do veículo e preenche a placa.
 */
export function PortariaEntryForm({ isPending, onSubmit }: PortariaEntryFormProps) {
  const { t } = useTranslation('access')

  const [qrOpen, setQrOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: { plate: '', accessRequestId: '', temporaryDriverName: '' },
  })

  const handleQrResolved = (vehicle: ResolvedVehicleQr) => {
    setValue('plate', vehicle.plate, { shouldValidate: true })
    setQrOpen(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Placa */}
      <div className="space-y-2">
        <Label htmlFor="entry-plate">
          {t('form.entry.plate.label')}
          <span className="text-destructive"> *</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="entry-plate"
            {...register('plate')}
            aria-invalid={!!errors.plate}
            placeholder={t('form.entry.plate.placeholder')}
            className="uppercase"
            maxLength={10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setQrOpen(true)}
            title={t('form.entry.qr.hint')}
            aria-label={t('form.entry.qr.label')}
          >
            <QrCode className="size-4" />
          </Button>
        </div>
        {errors.plate?.message ? (
          <p className="text-destructive text-xs">{t(errors.plate.message)}</p>
        ) : null}
      </div>

      {/* Solicitação autorizada */}
      <div className="space-y-2">
        <Label htmlFor="entry-access-request">{t('form.entry.accessRequestId.label')}</Label>
        <Input
          id="entry-access-request"
          {...register('accessRequestId')}
          aria-invalid={!!errors.accessRequestId}
          placeholder={t('form.entry.accessRequestId.placeholder')}
        />
        {errors.accessRequestId?.message ? (
          <p className="text-destructive text-xs">{t(errors.accessRequestId.message)}</p>
        ) : null}
      </div>

      {/* Condutor temporário */}
      <div className="space-y-2">
        <Label htmlFor="entry-driver">{t('form.entry.temporaryDriverName.label')}</Label>
        <Input
          id="entry-driver"
          {...register('temporaryDriverName')}
          placeholder={t('form.entry.temporaryDriverName.placeholder')}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t('form.entry.submitting') : t('form.entry.submit')}
      </Button>

      <QrResolveDialog open={qrOpen} onOpenChange={setQrOpen} onResolved={handleQrResolved} />
    </form>
  )
}
