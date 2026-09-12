// React
import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

// Shared (ui primitives)
import { cn } from '#/shared/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover'

/** Limite padrão de opções renderizadas pelo seletor. */
export const SEARCH_PICKER_MAX_OPTIONS = 6

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
  /** Etiqueta curta ao lado do texto (ex.: "Vinculado"/"Não vinculado"). */
  badge?: string
  /** Tom da etiqueta (`muted` neutro, `warning` chama atenção). */
  badgeTone?: 'muted' | 'warning'
  /** Se o texto principal deve ser exibido em maiúsculas. */
  uppercasePrimary?: boolean
}

/**
 * Grupo rotulado de opções (ex.: "Vinculados" e "Sugestões" na ficha da
 * portaria). O rótulo é apenas visual (`role="presentation"`).
 */
export interface SearchPickerGroup {
  /** Rótulo do grupo (não focável). */
  label: string
  /** Opções do grupo (cada grupo corta em `maxOptions`). */
  options: SearchPickerOption[]
}

/**
 * Linha renderizada na lista: rótulo de grupo ou opção.
 *
 * O `index` da opção é a posição na **ordem visual** (atravessa grupos) — é o
 * índice usado pelo teclado e pelo `aria-activedescendant`.
 */
type SearchPickerRow =
  | { kind: 'label'; key: string; label: string }
  | { kind: 'option'; key: string; domId: string; index: number; option: SearchPickerOption }

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
  /**
   * Opções filtradas pelo termo (lista plana).
   *
   * Ignorada quando `groups` é informado — nesse caso a lista plana é a
   * concatenação dos grupos.
   */
  options?: SearchPickerOption[]
  /**
   * Grupos rotulados de opções (ex.: "Vinculados" e "Sugestões").
   *
   * Quando informado, o popover renderiza um rótulo por grupo e **cada grupo**
   * corta em `maxOptions`. Grupos sem opções não renderizam rótulo.
   */
  groups?: SearchPickerGroup[]
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
  /**
   * Máximo de opções renderizadas de uma vez (a lista tem scroll interno).
   *
   * Com `groups`, o limite é aplicado **por grupo**.
   * @default SEARCH_PICKER_MAX_OPTIONS
   */
  maxOptions?: number
}

/**
 * Seletor de busca genérico (input + lista de resultados + chip selecionado).
 *
 * Componente presentacional compartilhado: não faz chamadas HTTP nem define
 * textos — recebe as opções e o termo de busca controlado pelo consumidor
 * (que é quem aplica debounce, consulta o backend e resolve o i18n). Usado
 * pelos seletores de veículo e usuário da tela de solicitações.
 *
 * Os resultados aparecem **sobrepostos** (Popover ancorado ao input, em portal)
 * — não reservam espaço no fluxo, então não empurram o restante do formulário
 * e não são recortados pelo `overflow` de um modal.
 *
 * A lista aceita `groups` (rótulos + opções, cada grupo cortado em
 * `maxOptions`) para a ficha da portaria distinguir "vinculados" de
 * "sugestões" — o teclado percorre a lista na ordem visual, atravessando os
 * grupos.
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
  groups,
  isPending,
  uppercase = false,
  invalid = false,
  ariaDescribedBy,
  onSelectOption,
  maxOptions = SEARCH_PICKER_MAX_OPTIONS,
}: SearchPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<SearchPickerOption | null>(null)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const listboxId = `${id}-listbox`

  /**
   * Monta as linhas da lista (rótulos + opções) na **ordem visual**.
   *
   * Sem `groups` o comportamento é o de antes (`options` cortado em
   * `maxOptions`); com `groups`, cada grupo corta em `maxOptions` e o `id` do
   * item inclui o índice do grupo — uma mesma pessoa em dois grupos (vinculado
   * e sugestão) não gera `id` duplicado no `aria-activedescendant`.
   */
  const { rows, visibleOptions, visibleDomIds } = useMemo(() => {
    const nextRows: SearchPickerRow[] = []
    const nextOptions: SearchPickerOption[] = []
    const nextDomIds: string[] = []

    if (groups) {
      groups.forEach((group, groupIndex) => {
        const visible = group.options.slice(0, maxOptions)
        if (visible.length === 0) {
          return
        }

        nextRows.push({ kind: 'label', key: `group-${groupIndex}`, label: group.label })
        visible.forEach((option) => {
          const domId = `${id}-group-${groupIndex}-option-${option.id}`
          nextRows.push({ kind: 'option', key: domId, domId, index: nextOptions.length, option })
          nextOptions.push(option)
          nextDomIds.push(domId)
        })
      })
    } else {
      ;(options ?? []).slice(0, maxOptions).forEach((option, index) => {
        const domId = `${id}-option-${option.id}`
        nextRows.push({ kind: 'option', key: domId, domId, index, option })
        nextOptions.push(option)
        nextDomIds.push(domId)
      })
    }

    return { rows: nextRows, visibleOptions: nextOptions, visibleDomIds: nextDomIds }
  }, [groups, id, maxOptions, options])

  /**
   * Assinatura do **conteúdo** dos resultados.
   *
   * A identidade dos arrays muda a cada render nos consumidores (listas
   * montadas inline) — reiniciar o destaque por identidade quebraria a
   * navegação por teclado.
   */
  const resultsKey = useMemo(
    () =>
      groups
        ? groups
            .map((group) => `${group.label}#${group.options.map((option) => option.id).join(',')}`)
            .join('|')
        : (options ?? []).map((option) => option.id).join(','),
    [groups, options],
  )

  // Sincroniza o chip com o valor do formulário (resets ao fechar/reabrir).
  useEffect(() => {
    if (!value) {
      setSelected(null)
    }
  }, [value])

  // Reinicia o destaque quando o termo ou os resultados mudam.
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [search, resultsKey])

  const close = () => {
    setOpen(false)
    setHighlightedIndex(-1)
  }

  const handleSelect = (option: SearchPickerOption) => {
    setSelected(option)
    onChange(option.id)
    onSearchChange('')
    onSelectOption?.(option)
    close()
  }

  const handleClear = () => {
    setSelected(null)
    onChange('')
    onSearchChange('')
    close()
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

  const empty = visibleOptions.length === 0
  const showNoResults = isPending || empty
  const activeOptionId = highlightedIndex >= 0 ? visibleDomIds[highlightedIndex] : undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlightedIndex((current) =>
        visibleOptions.length === 0 ? -1 : (current + 1) % visibleOptions.length,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlightedIndex((current) =>
        visibleOptions.length === 0 ? -1 : current <= 0 ? visibleOptions.length - 1 : current - 1,
      )
      return
    }

    if (event.key === 'Enter') {
      const option = open ? visibleOptions[highlightedIndex] : undefined
      if (option) {
        event.preventDefault()
        handleSelect(option)
      }
      return
    }

    if (event.key === 'Escape') {
      close()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div>
            <Input
              ref={inputRef}
              id={id}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              autoComplete="off"
              value={search}
              onChange={(event) => {
                onSearchChange(event.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-invalid={invalid}
              aria-describedby={ariaDescribedBy}
              className={uppercase ? 'uppercase' : undefined}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          // O foco fica no input (combobox) — o conteúdo não deve roubá-lo.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            // Interagir com o próprio input não fecha o seletor.
            if (inputRef.current?.contains(event.target as Node)) {
              event.preventDefault()
            }
          }}
          className="w-(--radix-popover-trigger-width) p-0"
        >
          {showNoResults ? (
            <p className="text-muted-foreground px-3 py-2 text-xs">{noResultsLabel}</p>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="max-h-56 overflow-auto p-1"
            >
              {rows.map((row) =>
                row.kind === 'label' ? (
                  <li
                    key={row.key}
                    role="presentation"
                    className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium"
                  >
                    {row.label}
                  </li>
                ) : (
                  <li
                    key={row.key}
                    id={row.domId}
                    role="option"
                    aria-selected={row.index === highlightedIndex}
                    className={cn(
                      'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                      row.index === highlightedIndex && 'bg-muted',
                    )}
                    onMouseEnter={() => setHighlightedIndex(row.index)}
                    // Evita o blur do input antes do clique (o foco permanece nele).
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(row.option)}
                  >
                    <span
                      className={
                        row.option.uppercasePrimary ? 'font-medium uppercase' : 'font-medium'
                      }
                    >
                      {row.option.primary}
                    </span>
                    {row.option.badge ? (
                      <span
                        className={cn(
                          'ml-2 text-xs font-medium',
                          row.option.badgeTone === 'warning'
                            ? 'text-amber-600'
                            : 'text-muted-foreground',
                        )}
                      >
                        {row.option.badge}
                      </span>
                    ) : null}
                    {row.option.secondary ? (
                      <span className="text-muted-foreground"> · {row.option.secondary}</span>
                    ) : null}
                  </li>
                ),
              )}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
