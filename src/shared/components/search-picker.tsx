// React
import { useEffect, useState } from 'react'

// Shared (ui primitives)
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

/**
 * Opção exibida pelo seletor (dados genéricos — sem i18n/acoplamento).
 */
export interface SearchPickerOption {
  /** Id do item (valor do formulário). */
  id: string
  /** Texto principal (ex.: placa ou nome). */
  primary: string
  /** Texto secundário opcional (ex.: modelo ou e-mail). */
  secondary?: string
  /** Se o texto principal deve ser exibido em maiúsculas. */
  uppercasePrimary?: boolean
}

export type SearchPickerProps = {
  /** Rótulo do campo de busca. */
  label: string
  /** Placeholder do input de busca. */
  searchPlaceholder: string
  /** Texto de "nenhum resultado"/carregando. */
  noResultsLabel: string
  /** Rótulo exibido acima do chip do item selecionado. */
  selectedLabel: string
  /** `id` do input (unicidade entre campos da página). */
  id: string
  /** Id selecionado (vazio = nenhum). */
  value: string
  /** Reporta a seleção (id) ou a limpeza (`''`). */
  onChange: (value: string) => void
  /** Termo de busca cru (estado controlado pelo consumidor). */
  search: string
  /** Atualiza o termo de busca (o consumidor aplica debounce + fetch). */
  onSearchChange: (search: string) => void
  /** Opções filtradas pelo termo. */
  options: SearchPickerOption[]
  /** Se a busca está carregando. */
  isPending: boolean
  /** Exibe o input em maiúsculas (ex.: placa). */
  uppercase?: boolean
  /** Marca o input como inválido (`aria-invalid`). */
  invalid?: boolean
  /** `id` do elemento que descreve o erro (`aria-describedby`). */
  ariaDescribedBy?: string
  /** Opcional: devolve a opção escolhida (além do `onChange(id)`). */
  onSelectOption?: (option: SearchPickerOption) => void
}

/**
 * Seletor de busca genérico (input + lista de resultados + chip selecionado).
 *
 * Componente presentacional compartilhado: não faz chamadas HTTP nem define
 * textos — recebe as opções e o termo de busca controlado pelo consumidor
 * (que é quem aplica debounce, consulta o backend e resolve o i18n). Usado
 * pelos seletores de veículo e usuário da tela de solicitações.
 */
export function SearchPicker({
  label,
  searchPlaceholder,
  noResultsLabel,
  selectedLabel,
  id,
  value,
  onChange,
  search,
  onSearchChange,
  options,
  isPending,
  uppercase = false,
  invalid = false,
  ariaDescribedBy,
  onSelectOption,
}: SearchPickerProps) {
  const [selected, setSelected] = useState<SearchPickerOption | null>(null)

  // Sincroniza o chip com o valor do formulário (resets ao fechar/reabrir).
  useEffect(() => {
    if (!value) {
      setSelected(null)
    }
  }, [value])

  const handleSelect = (option: SearchPickerOption) => {
    setSelected(option)
    onChange(option.id)
    onSearchChange('')
    onSelectOption?.(option)
  }

  const handleClear = () => {
    setSelected(null)
    onChange('')
    onSearchChange('')
  }

  if (selected) {
    return (
      <div className="space-y-1">
        <Label>{selectedLabel}</Label>
        <div className="flex items-center justify-between rounded-md border p-2 text-sm">
          <span>
            <span className={selected.uppercasePrimary ? 'font-medium uppercase' : 'font-medium'}>
              {selected.primary}
            </span>
            {selected.secondary ? (
              <span className="text-muted-foreground"> · {selected.secondary}</span>
            ) : null}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            ×
          </Button>
        </div>
      </div>
    )
  }

  const empty = options.length === 0
  const showNoResults = isPending || empty

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        aria-invalid={invalid}
        aria-describedby={ariaDescribedBy}
        className={uppercase ? 'uppercase' : undefined}
      />
      {showNoResults ? <p className="text-muted-foreground text-xs">{noResultsLabel}</p> : null}
      {!isPending && options.length > 0 ? (
        <ul className="max-h-40 overflow-auto rounded-md border">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
              >
                <span className={option.uppercasePrimary ? 'font-medium uppercase' : 'font-medium'}>
                  {option.primary}
                </span>
                {option.secondary ? (
                  <span className="text-muted-foreground"> · {option.secondary}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
