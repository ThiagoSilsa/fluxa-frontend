// React
import { useEffect, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useVehicleOptionsQuery } from '../hooks/use-vehicle-options-query'

// Types
import type { VehicleOption } from '../types/access-requests.types'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { Button, Input, Label } from '#/shared/components'

export type VehiclePickerProps = {
  /** Id do veículo selecionado (vazio = nenhum). */
  value: string
  /** Reporta a seleção (id) ou a limpeza (`''`). */
  onChange: (vehicleId: string) => void
}

/**
 * Seletor de veículo cadastrado (cenários NEW_USER/LINK).
 *
 * Busca por placa/modelo com debounce (400ms) e lista as opções para o
 * porteiro selecionar; o veículo escolhido aparece como chip com opção de
 * limpar.
 */
export function VehiclePicker({ value, onChange }: VehiclePickerProps) {
  const { t } = useTranslation('accessRequests')

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<VehicleOption | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)

  const { data, isPending } = useVehicleOptionsQuery(debouncedSearch || null)

  // Sincroniza com o valor do formulário (resets ao fechar/reabrir).
  useEffect(() => {
    if (!value) {
      setSelected(null)
    }
  }, [value])

  const handleSelect = (option: VehicleOption) => {
    setSelected(option)
    onChange(option.id)
    setSearch('')
  }

  const handleClear = () => {
    setSelected(null)
    onChange('')
    setSearch('')
  }

  if (selected) {
    return (
      <div className="space-y-1">
        <Label>{t('create.vehicle.selected')}</Label>
        <div className="flex items-center justify-between rounded-md border p-2 text-sm">
          <span>
            <span className="font-medium uppercase">{selected.plate}</span>
            {selected.model ? (
              <span className="text-muted-foreground"> · {selected.model}</span>
            ) : null}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            ×
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{t('create.vehicle.label')}</Label>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('create.vehicle.search')}
        className="uppercase"
      />
      {isPending ? (
        <p className="text-muted-foreground text-xs">{t('create.vehicle.none')}</p>
      ) : null}
      {data && data.length === 0 ? (
        <p className="text-muted-foreground text-xs">{t('create.vehicle.none')}</p>
      ) : null}
      {data && data.length > 0 ? (
        <ul className="max-h-40 overflow-auto rounded-md border">
          {data.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
              >
                <span className="font-medium uppercase">{option.plate}</span>
                {option.model ? (
                  <span className="text-muted-foreground"> · {option.model}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
