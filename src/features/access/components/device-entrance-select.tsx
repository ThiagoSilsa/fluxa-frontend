// i18n
import { useTranslation } from 'react-i18next'

// Shared components
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

// Types
import type { AccessRecordEntranceOption } from '../types/access.types'

// Lib
import { NO_SELECTION_VALUE } from '../lib/access.lib'

export type DeviceEntranceSelectProps = {
  /** Portarias ativas da empresa (`parameters` do feed). */
  entrances: AccessRecordEntranceOption[]
  /** Portaria escolhida no dispositivo (`null` = sem portaria). */
  value: string | null
  /** Reporta a escolha (`null` = sem portaria). */
  onChange: (entranceId: string | null) => void
  /** Desabilita enquanto a lista de portarias não chegou. */
  disabled?: boolean
}

/**
 * Seletor da portaria **deste dispositivo** (regra 61).
 *
 * O porteiro escolhe uma vez: a escolha fica no `localStorage` e passa a
 * carimbar entrada, saída e impedimento — e vira o filtro padrão da lista. As
 * portarias vêm de `parameters` do feed (o porteiro não tem
 * `MANAGE_ENTRANCES`), e "Sem portaria" é uma escolha válida (o backend aceita
 * o registro sem `entranceId`).
 */
export function DeviceEntranceSelect({
  entrances,
  value,
  onChange,
  disabled = false,
}: DeviceEntranceSelectProps) {
  const { t } = useTranslation('access')

  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="device-entrance"
        className="text-muted-foreground shrink-0 text-xs font-medium"
      >
        {t('deviceEntrance.label')}
      </Label>
      <Select
        value={value ?? NO_SELECTION_VALUE}
        onValueChange={(next) => onChange(next === NO_SELECTION_VALUE ? null : next)}
        disabled={disabled}
      >
        <SelectTrigger id="device-entrance" className="w-56" aria-label={t('deviceEntrance.label')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SELECTION_VALUE}>{t('deviceEntrance.none')}</SelectItem>
          {entrances.map((entrance) => (
            <SelectItem key={entrance.id} value={entrance.id}>
              {entrance.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
