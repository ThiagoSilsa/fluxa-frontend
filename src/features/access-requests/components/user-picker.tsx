// React
import { useEffect, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useUserOptionsQuery } from '../hooks/use-user-options-query'

// Types
import type { UserOption } from '../types/access-requests.types'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { Button, Input, Label } from '#/shared/components'

export type UserPickerProps = {
  /** Id do usuário selecionado (vazio = nenhum). */
  value: string
  /** Reporta a seleção (id) ou a limpeza (`''`). */
  onChange: (userId: string) => void
}

/**
 * Seletor de usuário cadastrado (cenários NEW_VEHICLE/LINK).
 *
 * Busca por nome/e-mail com debounce (400ms) e lista as opções para o
 * porteiro selecionar; o usuário escolhido aparece como chip com opção de
 * limpar.
 */
export function UserPicker({ value, onChange }: UserPickerProps) {
  const { t } = useTranslation('accessRequests')

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserOption | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)

  const { data, isPending } = useUserOptionsQuery(debouncedSearch || null)

  // Sincroniza com o valor do formulário (resets ao fechar/reabrir).
  useEffect(() => {
    if (!value) {
      setSelected(null)
    }
  }, [value])

  const handleSelect = (option: UserOption) => {
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
        <Label>{t('create.user.selected')}</Label>
        <div className="flex items-center justify-between rounded-md border p-2 text-sm">
          <span>
            <span className="font-medium">{selected.name}</span>
            <span className="text-muted-foreground"> · {selected.email}</span>
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
      <Label>{t('create.user.label')}</Label>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('create.user.search')}
      />
      {isPending ? <p className="text-muted-foreground text-xs">{t('create.user.none')}</p> : null}
      {data && data.length === 0 ? (
        <p className="text-muted-foreground text-xs">{t('create.user.none')}</p>
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
                <span className="font-medium">{option.name}</span>
                <span className="text-muted-foreground"> · {option.email}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
