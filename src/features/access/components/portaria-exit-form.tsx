// React
import { useState } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { Eye, LogOut } from 'lucide-react'

// Schemas
import { exitFormSchema } from '../schemas/portaria.schema'

// Hooks
import { useOpenAccessQuery } from '../hooks/use-open-access-query'

// Lib
import { formatDateTime } from '../lib/access.lib'

// Types
import type { ExitFormValues } from '../schemas/portaria.schema'
import type { OpenAccessResponse } from '../types/access.types'

// Shared
import { Button, Input, Label } from '#/shared/components'

export type PortariaExitFormProps = {
  /** Desabilita o submit enquanto a saída está pendente. */
  isPending: boolean
  /** Callback de submit com os valores validados. */
  onSubmit: (values: ExitFormValues) => void
}

/**
 * Lista os acessos abertos de uma placa (conferência).
 */
function OpenAccessList({ accesses }: { accesses: OpenAccessResponse[] }) {
  const { t } = useTranslation('access')

  if (accesses.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('open.empty')}</p>
  }

  return (
    <ul className="space-y-2">
      {accesses.map((access) => (
        <li
          key={access.id}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <div className="space-y-0.5">
            <p className="font-medium">{access.driver.name ?? access.temporaryPlate ?? '—'}</p>
            <p className="text-muted-foreground text-xs">
              {t('open.driver')}: {access.driver.name ?? '—'} · {t('open.entryAt')}:{' '}
              {formatDateTime(access.entryAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Formulário de saída da portaria.
 *
 * Campos: placa (obrigatória) e passageiro (opcional — exigido pelo backend
 * quando não há entrada registrada). O porteiro pode consultar quem está
 * dentro (`GET /access/open`) antes de registrar a saída.
 */
export function PortariaExitForm({ isPending, onSubmit }: PortariaExitFormProps) {
  const { t } = useTranslation('access')

  const [consulted, setConsulted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExitFormValues>({
    resolver: zodResolver(exitFormSchema),
    defaultValues: { plate: '', temporaryDriverName: '' },
  })

  const plate = watch('plate')
  const { data, isPending: isConsulting } = useOpenAccessQuery(consulted ? plate : null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Placa */}
      <div className="space-y-2">
        <Label htmlFor="exit-plate">
          {t('form.exit.plate.label')}
          <span className="text-destructive"> *</span>
        </Label>
        <Input
          id="exit-plate"
          {...register('plate')}
          aria-invalid={!!errors.plate}
          placeholder={t('form.exit.plate.placeholder')}
          className="uppercase"
          maxLength={10}
        />
        {errors.plate?.message ? (
          <p className="text-destructive text-xs">{t(errors.plate.message)}</p>
        ) : null}
      </div>

      {/* Passageiro */}
      <div className="space-y-2">
        <Label htmlFor="exit-passenger">{t('form.exit.temporaryDriverName.label')}</Label>
        <Input
          id="exit-passenger"
          {...register('temporaryDriverName')}
          placeholder={t('form.exit.temporaryDriverName.placeholder')}
        />
      </div>

      {/* Conferência */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setConsulted(true)}
          disabled={isConsulting}
        >
          <Eye className="mr-2 size-4" />
          {isConsulting ? t('form.exit.consulting') : t('form.exit.consult')}
        </Button>
        {consulted && data ? <OpenAccessList accesses={data.data} /> : null}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        <LogOut className="mr-2 size-4" />
        {isPending ? t('form.exit.submitting') : t('form.exit.submit')}
      </Button>
    </form>
  )
}
