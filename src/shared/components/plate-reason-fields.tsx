// React Hook Form
import type { FieldError, FieldErrors, Path, UseFormRegister } from 'react-hook-form'

// Shared (ui primitives)
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

/**
 * Forma mínima dos formulários que usam os campos de placa + motivo
 * (bloqueio, solicitação de bloqueio e revogação).
 */
export type PlateReasonFormShape = {
  reason: string
  plate?: string
}

export type PlateReasonFieldsProps<T extends PlateReasonFormShape> = {
  /** Registro RHF do formulário (`plate` e/ou `reason`). */
  register: UseFormRegister<T>
  /** Erros do formulário. */
  errors: FieldErrors<T>
  /** Resolve a chave de erro (i18n key) para o texto traduzido. */
  translateError: (key?: string) => string
  /** Rótulos/placeholders — vêm do i18n de quem consome (sem i18n aqui). */
  texts: {
    plateLabel?: string
    platePlaceholder?: string
    reasonLabel: string
    reasonPlaceholder: string
  }
  /** Prefixo dos `id` (ex.: `block`, `revoke`) para unicidade entre diálogos. */
  idPrefix: string
  /** Se `false`, renderiza apenas o motivo (ex.: revogação de bloqueio). */
  showPlate?: boolean
}

/**
 * Campos compartilhados "placa + motivo" (sem i18n/acoplamento de domínio).
 *
 * Peça genérica usada pelos fluxos de bloqueio direto (MANAGE_BLOCKS),
 * solicitação de bloqueio do porteiro e revogação — e reutilizada pelas telas
 * de veículos/solicitações (tickets 06/10), evitando duplicar o formulário
 * entre features (regra: nenhuma importação entre features).
 *
 * @template T Forma do formulário (tem `reason`; `plate` opcional).
 */
export function PlateReasonFields<T extends PlateReasonFormShape>({
  register,
  errors,
  translateError,
  texts,
  idPrefix,
  showPlate = true,
}: PlateReasonFieldsProps<T>) {
  const plateError = errors.plate as FieldError | undefined
  const reasonError = errors.reason as FieldError | undefined
  const plateMessage = typeof plateError?.message === 'string' ? plateError.message : undefined
  const reasonMessage = typeof reasonError?.message === 'string' ? reasonError.message : undefined

  return (
    <>
      {showPlate ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-plate`}>
            {texts.plateLabel}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id={`${idPrefix}-plate`}
            {...register('plate' as Path<T>)}
            aria-invalid={!!plateError}
            placeholder={texts.platePlaceholder}
            className="uppercase"
            maxLength={10}
          />
          {plateMessage ? (
            <p className="text-destructive text-xs">{translateError(plateMessage)}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-reason`}>
          {texts.reasonLabel}
          <span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id={`${idPrefix}-reason`}
          {...register('reason' as Path<T>)}
          aria-invalid={!!reasonError}
          placeholder={texts.reasonPlaceholder}
          rows={3}
        />
        {reasonMessage ? (
          <p className="text-destructive text-xs">{translateError(reasonMessage)}</p>
        ) : null}
      </div>
    </>
  )
}
