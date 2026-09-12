// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { AccessContextDriver } from '../types/access.types'

// Shared
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

export type AccessDriverSelectProps = {
  /** Condutores oferecidos (vinculados + sugestões do contexto). */
  drivers: AccessContextDriver[]
  /** Id do condutor escolhido (vazio = nenhum). */
  value: string
  /** Reporta a escolha. */
  onChange: (driverId: string) => void
  /** Marcador de "sem condutor" no `Select` (Radix não aceita `''`). */
  disabled?: boolean
}

/** Valor do item "sem condutor" (o `Select` do Radix não aceita string vazia). */
export const NO_DRIVER_VALUE = 'none'

/**
 * Escolha de quem vai dirigir na ficha da portaria.
 *
 * Versão mínima: lista os condutores que o contexto já devolve (vinculados e
 * sugestões da busca). A busca por nome/telefone/documento e o cadastro de um
 * condutor novo entram no ticket 04, com o `SearchPicker` agrupado — este
 * componente é substituído lá.
 */
export function AccessDriverSelect({
  drivers,
  value,
  onChange,
  disabled = false,
}: AccessDriverSelectProps) {
  const { t } = useTranslation('access')

  if (drivers.length === 0) {
    return <p className="text-muted-foreground text-xs">{t('register.driver.empty')}</p>
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="register-driver">{t('register.driver.label')}</Label>
      <Select
        value={value || NO_DRIVER_VALUE}
        onValueChange={(next) => onChange(next === NO_DRIVER_VALUE ? '' : next)}
        disabled={disabled}
      >
        <SelectTrigger id="register-driver" className="w-full">
          <SelectValue placeholder={t('register.driver.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_DRIVER_VALUE}>{t('register.driver.placeholder')}</SelectItem>
          {drivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id}>
              {driver.name}
              {driver.linked ? '' : ` · ${t('verdict.drivers.notLinked')}`}
              {driver.canDrive ? '' : ` · ${t('verdict.drivers.noPermission')}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
