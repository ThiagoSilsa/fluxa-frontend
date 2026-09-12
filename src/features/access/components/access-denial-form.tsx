// React
import { useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { getDenialReasonLabelKey } from '../lib/access.lib'

// Types
import type { EntryDenialReason } from '../types/access.types'

// Shared
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '#/shared/components'

/** Motivos do impedimento na ordem exibida (lista fechada do backend). */
export const DENIAL_REASONS: EntryDenialReason[] = [
  'BLOCKED',
  'UNREGISTERED',
  'UNAUTHORIZED_DRIVER',
  'OVERDUE',
  'OTHER',
]

export type AccessDenialFormProps = {
  /** Motivo inicial (sugerido pela negativa do veredito). */
  initialReason?: EntryDenialReason
  /** Observação inicial (pré-preenchida com o motivo da negativa). */
  initialObservation?: string
  /** Envia o impedimento. */
  onSubmit: (values: { reason: EntryDenialReason; observation: string }) => void
  /** Desabilita o envio enquanto a mutation roda. */
  isPending: boolean
}

/**
 * Formulário de impedimento do modal da portaria.
 *
 * Motivo em lista fechada e observação — obrigatória **apenas** em `OTHER`
 * (o backend responde 400 sem ela). O pedido de bloqueio do veículo entra no
 * ticket 05 (`requestBlock`/`blockReason`, desmarcado por padrão).
 */
export function AccessDenialForm({
  initialReason = 'UNAUTHORIZED_DRIVER',
  initialObservation = '',
  onSubmit,
  isPending,
}: AccessDenialFormProps) {
  const { t } = useTranslation('access')

  const [reason, setReason] = useState<EntryDenialReason>(initialReason)
  const [observation, setObservation] = useState(initialObservation)
  const [touched, setTouched] = useState(false)

  const observationRequired = reason === 'OTHER'
  const observationMissing = observationRequired && observation.trim().length === 0

  const handleSubmit = () => {
    setTouched(true)
    if (observationMissing) {
      return
    }
    onSubmit({ reason, observation: observation.trim() })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="denial-reason">{t('register.denial.reason.label')}</Label>
        <Select value={reason} onValueChange={(value) => setReason(value as EntryDenialReason)}>
          <SelectTrigger id="denial-reason" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DENIAL_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(getDenialReasonLabelKey(option))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="denial-observation">{t('register.denial.observation.label')}</Label>
        <Textarea
          id="denial-observation"
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          placeholder={t('register.denial.observation.placeholder')}
          aria-invalid={observationMissing && touched}
          rows={3}
        />
        {observationMissing && touched ? (
          <p className="text-destructive text-xs">{t('register.denial.observation.required')}</p>
        ) : null}
      </div>

      <Button type="button" onClick={handleSubmit} disabled={isPending}>
        {isPending ? t('register.actions.submitting') : t('register.actions.denial')}
      </Button>
    </div>
  )
}
