// i18n
import { useTranslation } from 'react-i18next'

// Components
import { SearchPicker } from '#/shared/components'

// Types
import type { AccessContextDriver } from '../types/access.types'
import type { SearchPickerGroup, SearchPickerOption } from '#/shared/components'

export type AccessDriverPickerProps = {
  /** Condutores vinculados ao veículo (até 3, primário primeiro). */
  linked: AccessContextDriver[]
  /** Sugestões da busca (pessoas da empresa sem vínculo). */
  suggestions: AccessContextDriver[]
  /** Id do condutor escolhido. */
  value: string
  /** Reporta a escolha. */
  onChange: (driverId: string) => void
  /** Termo de busca (controlado pelo modal, que aplica debounce). */
  search: string
  /** Reporta a digitação (o modal consulta o contexto com `search`). */
  onSearchChange: (search: string) => void
  /** Se a busca está em andamento. */
  isPending: boolean
  /** Abre o sub-formulário de condutor novo. */
  onNewDriver: () => void
  /** Esconde o atalho de condutor novo (ex.: enquanto o formulário está aberto). */
  hideNewDriver?: boolean
}

/**
 * Escolha de quem vai dirigir na ficha da portaria (regra 41).
 *
 * `SearchPicker` com **grupos**: "Vinculados" (até 3, primário primeiro) e
 * "Sugestões" (até 3 pessoas da empresa sem vínculo com o veículo, que só
 * aparecem com busca). Cada item mostra a etiqueta de vínculo e, quando o
 * condutor vinculado não pode dirigir, o aviso em âmbar — o servidor devolve o
 * veredito `ALLOW_WITH_REQUEST` quando ele é escolhido, e a ficha explica que a
 * entrada sai com solicitação.
 *
 * A busca é por **nome, telefone ou documento** (o backend resolve os dígitos),
 * então o balcão acha a pessoa pelo telefone quando o nome não vem na hora.
 */
export function AccessDriverPicker({
  linked,
  suggestions,
  value,
  onChange,
  search,
  onSearchChange,
  isPending,
  onNewDriver,
  hideNewDriver = false,
}: AccessDriverPickerProps) {
  const { t } = useTranslation('access')

  const toOption = (driver: AccessContextDriver): SearchPickerOption => ({
    id: driver.id,
    primary: driver.name,
    badge: driver.linked
      ? driver.canDrive
        ? undefined
        : t('verdict.drivers.noPermission')
      : t('verdict.drivers.notLinked'),
    badgeTone: driver.linked && !driver.canDrive ? 'warning' : 'muted',
  })

  const groups: SearchPickerGroup[] = [
    { label: t('register.driver.linked'), options: linked.map(toOption) },
    { label: t('register.driver.suggestions'), options: suggestions.map(toOption) },
  ]

  return (
    <div className="space-y-2">
      <SearchPicker
        id="register-driver"
        label={t('register.driver.label')}
        searchPlaceholder={t('register.driver.placeholder')}
        noResultsLabel={t('register.driver.noResults')}
        selectedLabel={t('register.driver.selected')}
        value={value}
        onChange={onChange}
        search={search}
        onSearchChange={onSearchChange}
        groups={groups}
        maxOptions={3}
        isPending={isPending}
      />

      {hideNewDriver ? null : (
        <button
          type="button"
          onClick={onNewDriver}
          className="text-primary text-xs font-medium underline-offset-2 hover:underline"
        >
          {t('register.driver.new')}
        </button>
      )}
    </div>
  )
}
