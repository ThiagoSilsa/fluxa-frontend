// Components
import { EntityListEmpty } from './entity-list-empty'
import { EntityListGrid } from './entity-list-grid'
import { EntityListLoading } from './entity-list-loading'
import { EntityListPagination } from './entity-list-pagination'
import { EntityListToolbar } from './entity-list-toolbar'

// Hooks
import { useComfortableLoading } from '#/shared/hooks/use-comfortable-loading'

// lib
import { cn } from '#/shared/lib/utils'

// Types
import type { EntityListProps } from '../types/entity-list.types'

/**
 * Listagem genérica em grid de cards — renderiza dados e callbacks por props,
 * sem conhecer API, entidade, rotas ou regras de negócio.
 *
 * Inclui toolbar (filtros + ações por composição), loading (skeletons),
 * empty state customizado e paginação server-side (`offset`/`limit`, opcional).
 *
 * @template TItem Tipo dos itens listados.
 */
export function EntityList<TItem>({
  items,
  total,
  loading: rawLoading = false,
  renderItem,
  filters,
  toolbar,
  gridClassName,
  contentClassName,
  emptyState,
  pagination,
}: EntityListProps<TItem>) {
  /*
    Piso de visibilidade aqui dentro, e não em cada chamador: são nove telas
    usando esta listagem, e o esqueleto é desenhado por ela. Vale também para o
    estado vazio — trocar esqueleto por "nenhum resultado" em 40 ms é o mesmo
    piscar, com o agravante de a mensagem chegar depois de dois solavancos.
  */
  const loading = useComfortableLoading(rawLoading)

  return (
    <section className="flex h-full flex-col">
      <EntityListToolbar filters={filters} toolbar={toolbar} />

      {/* `cn` e não concatenação: o `tailwind-merge` deixa o chamador anular o
          `py-6` passando outro `py-*`, em vez de as duas classes brigarem. */}
      <div className={cn('flex-1 py-6', contentClassName)}>
        {loading ? (
          <EntityListLoading gridClassName={gridClassName} />
        ) : items.length === 0 ? (
          <EntityListEmpty>{emptyState}</EntityListEmpty>
        ) : (
          <EntityListGrid className={gridClassName}>
            {items.map((item, index) => (
              <div key={index}>{renderItem(item)}</div>
            ))}
          </EntityListGrid>
        )}
      </div>

      {pagination ? (
        <div className="mt-auto pt-6">
          <EntityListPagination {...pagination} total={total} />
        </div>
      ) : null}
    </section>
  )
}
