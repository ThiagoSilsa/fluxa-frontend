// React
import { useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useVehicleOptionsQuery } from '../hooks/use-vehicle-options-query'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { SearchPicker } from '#/shared/components'
import type { SearchPickerOption } from '#/shared/components'

export type VehiclePickerProps = {
  /** Id do veículo selecionado (vazio = nenhum). */
  value: string
  /** Reporta a seleção (id) ou a limpeza (`''`). */
  onChange: (vehicleId: string) => void
  /** Marca o input de busca como inválido (`aria-invalid`). */
  invalid?: boolean
  /** `id` do elemento que descreve o erro (`aria-describedby`). */
  ariaDescribedBy?: string
}

/**
 * Seletor de veículo cadastrado (cenários NEW_USER/LINK).
 *
 * Compõe o `SearchPicker` compartilhado com a busca do backend (placa/modelo,
 * debounce 400ms) e os textos i18n da feature — sem duplicar o markup de
 * seleção (ticket 01 — prefactor shared).
 */
export function VehiclePicker({
  value,
  onChange,
  invalid = false,
  ariaDescribedBy,
}: VehiclePickerProps) {
  const { t } = useTranslation('accessRequests')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const { data, isPending } = useVehicleOptionsQuery(debouncedSearch || null)

  const options: SearchPickerOption[] = (data ?? []).map((vehicle) => ({
    id: vehicle.id,
    primary: vehicle.plate,
    secondary: vehicle.model ?? undefined,
    uppercasePrimary: true,
  }))

  return (
    <SearchPicker
      id="ar-vehicle"
      label={t('create.vehicle.label')}
      searchPlaceholder={t('create.vehicle.search')}
      noResultsLabel={t('create.vehicle.none')}
      selectedLabel={t('create.vehicle.selected')}
      value={value}
      onChange={onChange}
      search={search}
      onSearchChange={setSearch}
      options={options}
      isPending={isPending}
      invalid={invalid}
      ariaDescribedBy={ariaDescribedBy}
      uppercase
    />
  )
}
