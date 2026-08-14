// React
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Router
import { useNavigate } from '@tanstack/react-router'

// Icons
import { Search } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { SidebarItem } from '../types/sidebar.type'
import type { SearchResult } from '../types/search.type'

// Lib
import { buildSearchIndex } from '../lib/search-sidebar-index'
import { searchPages } from '../lib/search-sidebar'

// Hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'

// Components
import {
  Input,
  SidebarMenuButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/shared/components'

const SEARCH_DEBOUNCE_MS = 200
const BLUR_CLOSE_DELAY_MS = 150

type SidebarSearchProps = {
  /** Itens da sidebar já filtrados por permissão */
  items: SidebarItem[]
  /** Se a sidebar está expandida */
  open: boolean
  /** Função para expandir a sidebar */
  setOpen: (open: boolean) => void
}

/**
 * Campo de busca de páginas na sidebar com overlay de resultados.
 * - Overlay customizado (absolute, sem portal) posicionado abaixo do input
 * - Debounce de 200ms via useDebouncedValue
 * - Navegação por teclado (↑↓ Enter Escape)
 * - Breadcrumbs e descrições nos resultados
 * - Scoring de relevância (label > descrição > keywords > breadcrumb)
 */
function SidebarSearchComponent({ items, open, setOpen }: SidebarSearchProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('mainLayout')

  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)

  // Índice flat memoizado — só recalcula quando os itens (permissões) mudam
  const searchIndex = useMemo(() => buildSearchIndex(items), [items])

  // Resultados da busca — só recalcula quando o termo debounced muda
  const results = useMemo(
    () => searchPages(debouncedQuery, searchIndex, t),
    [debouncedQuery, searchIndex, t],
  )

  // Reinicia o highlight quando os resultados mudam
  useEffect(() => {
    setHighlightedIndex(0)
  }, [results.length])

  // Reseta o estado de busca ao fechar a sidebar
  useEffect(() => {
    if (!open) {
      setQuery('')
      setHighlightedIndex(0)
    }
  }, [open])

  // Navega para a página e limpa o estado de busca
  const handleNavigate = useCallback(
    (result: SearchResult) => {
      navigate({ to: result.path })
      setQuery('')
      setHighlightedIndex(0)
    },
    [navigate],
  )

  // Navegação por teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[highlightedIndex]) {
            handleNavigate(results[highlightedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setQuery('')
          setHighlightedIndex(0)
          break
      }
    },
    [results, highlightedIndex, handleNavigate],
  )

  // Auto-focus no input quando a sidebar expandir
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Sidebar colapsada: exibe apenas o ícone de busca com tooltip
  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            onClick={() => setOpen(true)}
            className="ml-4 cursor-pointer"
            aria-label={t('sidebar.search.placeholder')}
          >
            <Search className="h-5 w-5" />
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right">{t('sidebar.search.placeholder')}</TooltipContent>
      </Tooltip>
    )
  }

  const showOverlay = isFocused && debouncedQuery.trim().length > 0

  return (
    <div className="relative px-3 py-2">
      {/* Input de busca com ícone de lupa */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Pequeno delay para permitir clique nos resultados antes do overlay fechar
            setTimeout(() => setIsFocused(false), BLUR_CLOSE_DELAY_MS)
          }}
          placeholder={t('sidebar.search.placeholder')}
          className="border-sidebar-border focus:border-accent focus:ring-accent pl-8"
          aria-label={t('sidebar.search.placeholder')}
          autoComplete="off"
        />
      </div>

      {/* Overlay de resultados — absolute, cobre os itens abaixo */}
      {showOverlay && (
        <div className="bg-popover absolute inset-x-3 top-full z-50 mt-1 rounded-md border shadow-lg">
          {results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">{t('sidebar.search.noResults')}</p>
            </div>
          ) : (
            <ul className="max-h-[50vh] overflow-y-auto py-1" role="listbox">
              {results.map((result, index) => {
                const isHighlighted = index === highlightedIndex

                return (
                  <li
                    key={result.path}
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseDown={(e) => {
                      // onMouseDown em vez de onClick para evitar conflito com onBlur do input
                      e.preventDefault()
                      handleNavigate(result)
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 text-sm transition-colors ${
                      isHighlighted ? 'bg-accent' : ''
                    }`}
                  >
                    {/* Ícone da página */}
                    <result.icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />

                    <div className="flex min-w-0 flex-col gap-0.5">
                      {/* Breadcrumb (ex: "Configurações › Geral") */}
                      {result.breadcrumb.length > 0 && (
                        <span className="text-muted-foreground truncate text-[8px] font-semibold tracking-wider uppercase">
                          {result.translatedBreadcrumb.join(' > ')}
                        </span>
                      )}

                      {/* Label da página */}
                      <span className="text-muted-foreground truncate font-medium">
                        {result.translatedLabel}
                      </span>

                      {/* Descrição (se houver) — sem truncate, quebra linha */}
                      {result.translatedDescription && (
                        <span className="text-muted-foreground text-xs leading-relaxed wrap-break-word whitespace-normal">
                          {result.translatedDescription}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(SidebarSearchComponent)
