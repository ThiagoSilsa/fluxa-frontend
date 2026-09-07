// React
import { useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useUserOptionsQuery } from '../hooks/use-user-options-query'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { SearchPicker } from '#/shared/components'
import type { SearchPickerOption } from '#/shared/components'

export type UserPickerProps = {
  /** Id do usuário selecionado (vazio = nenhum). */
  value: string
  /** Reporta a seleção (id) ou a limpeza (`''`). */
  onChange: (userId: string) => void
}

/**
 * Seletor de usuário cadastrado (cenários NEW_VEHICLE/LINK).
 *
 * Compõe o `SearchPicker` compartilhado com a busca do backend (nome/e-mail,
 * debounce 400ms) e os textos i18n da feature — sem duplicar o markup de
 * seleção (ticket 01 — prefactor shared).
 */
export function UserPicker({ value, onChange }: UserPickerProps) {
  const { t } = useTranslation('accessRequests')

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const { data, isPending } = useUserOptionsQuery(debouncedSearch || null)

  const options: SearchPickerOption[] = (data ?? []).map((user) => ({
    id: user.id,
    primary: user.name,
    secondary: user.email,
  }))

  return (
    <SearchPicker
      id="ar-user"
      label={t('create.user.label')}
      searchPlaceholder={t('create.user.search')}
      noResultsLabel={t('create.user.none')}
      selectedLabel={t('create.user.selected')}
      value={value}
      onChange={onChange}
      search={search}
      onSearchChange={setSearch}
      options={options}
      isPending={isPending}
    />
  )
}
