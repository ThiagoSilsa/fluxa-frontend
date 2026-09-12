// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { OccupancyDepartmentView } from '../types/access.types'

// Lib
import { NO_SELECTION_VALUE } from '../lib/access.lib'

// Shared
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

export type AccessDepartmentSelectProps = {
  /** Setores ativos (opções extras além do padrão do veículo). */
  departments: OccupancyDepartmentView[]
  /** Setor confirmado na ficha (`null` = vagas livres). */
  value: string | null
  /** Reporta a troca do setor. */
  onChange: (departmentId: string | null) => void
  /** Setor padrão do veículo (fallback quando a lista não carrega). */
  defaultDepartmentId: string | null
  /** Setor padrão do veículo (nome, para o fallback). */
  defaultDepartmentName: string | null
  disabled?: boolean
}

/**
 * Setor confirmado na entrada (regra 27).
 *
 * Pré-selecionado com o **padrão do veículo** (ou "sem setor") e trocável: a
 * troca refaz o contexto com `departmentId`, então a ocupação e o veredito de
 * vaga cheia acompanham o setor escolhido.
 *
 * A lista vem da ocupação (ver `useDepartmentOptionsQuery`); quando ela não
 * está disponível, o próprio setor padrão é a única opção — o select continua
 * funcional com o que o contexto garante.
 */
export function AccessDepartmentSelect({
  departments,
  value,
  onChange,
  defaultDepartmentId,
  defaultDepartmentName,
  disabled = false,
}: AccessDepartmentSelectProps) {
  const { t } = useTranslation('access')

  const options = [...departments]
  const hasDefaultOption =
    !!defaultDepartmentId && !options.some((item) => item.departmentId === defaultDepartmentId)
  if (hasDefaultOption && defaultDepartmentId) {
    options.unshift({
      departmentId: defaultDepartmentId,
      name: defaultDepartmentName ?? defaultDepartmentId,
      occupied: 0,
      capacity: 0,
      rate: null,
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="register-department">{t('register.department.label')}</Label>
      <Select
        value={value ?? NO_SELECTION_VALUE}
        onValueChange={(next) => onChange(next === NO_SELECTION_VALUE ? null : next)}
        disabled={disabled}
      >
        <SelectTrigger id="register-department" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SELECTION_VALUE}>{t('register.department.none')}</SelectItem>
          {options.map((department) => (
            <SelectItem key={department.departmentId} value={department.departmentId}>
              {department.name}
              {department.capacity > 0 ? ` · ${department.occupied}/${department.capacity}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
