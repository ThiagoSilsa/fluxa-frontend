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
  Checkbox,
  Input,
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

/** Valores coletados pelo formulário de impedimento. */
export interface AccessDenialFormValues {
  reason: EntryDenialReason
  observation: string
  /** Pedido de bloqueio do veículo (checkbox **desmarcado** por padrão). */
  requestBlock: boolean
  /** Motivo do bloqueio pedido (em branco = usa a observação). */
  blockReason: string
}

export type AccessDenialFormProps = {
  /** Motivo inicial (sugerido pela negativa do veredito). */
  initialReason?: EntryDenialReason
  /** Observação inicial (pré-preenchida com o motivo da negativa). */
  initialObservation?: string
  /**
   * Se o porteiro pode pedir o bloqueio (`CREATE_BLOCK_REQUEST`).
   *
   * O backend responde **403** quando o pedido é enviado sem a permissão, então
   * o checkbox nem aparece para quem não pode pedir (validação no cliente,
   * conforme o contrato do backend).
   */
  canRequestBlock?: boolean
  /** Envia o impedimento. */
  onSubmit: (values: AccessDenialFormValues) => void
  /** Desabilita o envio enquanto a mutation roda. */
  isPending: boolean
}

/**
 * Formulário de impedimento do modal da portaria.
 *
 * Motivo em lista fechada, observação — obrigatória **apenas** em `OTHER` (o
 * backend responde 400 sem ela) — e o pedido opcional de **bloqueio do
 * veículo**: checkbox desmarcado por padrão que, ao ser marcado, pede o motivo
 * do bloqueio já pré-preenchido com a observação. O impedimento é registrado de
 * qualquer forma; o bloqueio é um pedido à parte (a administração aprova).
 */
export function AccessDenialForm({
  initialReason = 'UNAUTHORIZED_DRIVER',
  initialObservation = '',
  canRequestBlock = false,
  onSubmit,
  isPending,
}: AccessDenialFormProps) {
  const { t } = useTranslation('access')

  const [reason, setReason] = useState<EntryDenialReason>(initialReason)
  const [observation, setObservation] = useState(initialObservation)
  const [requestBlock, setRequestBlock] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [touched, setTouched] = useState(false)

  const observationRequired = reason === 'OTHER'
  const observationMissing = observationRequired && observation.trim().length === 0

  /**
   * Marca/desmarca o pedido de bloqueio.
   *
   * Ao marcar, o motivo do bloqueio sai pré-preenchido com a observação (o
   * backend faria o mesmo fallback, mas assim o porteiro vê o que vai ser
   * enviado e pode ajustar).
   *
   * @param checked Novo estado do checkbox.
   */
  const handleRequestBlockChange = (checked: boolean) => {
    setRequestBlock(checked)
    if (checked && !blockReason.trim()) {
      setBlockReason(observation.trim())
    }
  }

  const handleSubmit = () => {
    setTouched(true)
    if (observationMissing) {
      return
    }
    onSubmit({
      reason,
      observation: observation.trim(),
      requestBlock,
      blockReason: requestBlock ? blockReason.trim() : '',
    })
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

      {/* Pedido de bloqueio: desmarcado por padrão e só com a permissão */}
      {canRequestBlock ? (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="denial-request-block"
              checked={requestBlock}
              onCheckedChange={(checked) => handleRequestBlockChange(checked === true)}
              disabled={isPending}
            />
            <div className="space-y-1">
              <Label htmlFor="denial-request-block">
                {t('register.denial.requestBlock.label')}
              </Label>
              <p className="text-muted-foreground text-xs">
                {t('register.denial.requestBlock.hint')}
              </p>
            </div>
          </div>

          {requestBlock ? (
            <div className="space-y-2">
              <Label htmlFor="denial-block-reason">
                {t('register.denial.requestBlock.reasonLabel')}
              </Label>
              <Input
                id="denial-block-reason"
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
                placeholder={t('register.denial.requestBlock.reasonPlaceholder')}
                disabled={isPending}
              />
              <p className="text-muted-foreground text-xs">
                {t('register.denial.requestBlock.reasonHint')}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="button" onClick={handleSubmit} disabled={isPending}>
        {isPending ? t('register.actions.submitting') : t('register.actions.denial')}
      </Button>
    </div>
  )
}
