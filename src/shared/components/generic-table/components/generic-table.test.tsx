// React
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Component
import { GenericTable } from './generic-table'

// Types
import type { ReactNode } from 'react'
import type { GenericTableCommonProps, TableExpandLabels } from '../types/generic-table.types'

type Row = { id: string; plate: string; observation: string | null }

const columnHelper = createColumnHelper<Row>()

const rows: Row[] = [
  { id: 'r1', plate: 'ABC1D23', observation: 'Motorista sem vínculo' },
  { id: 'r2', plate: 'XYZ9Z99', observation: null },
]

const columns = [
  columnHelper.accessor('plate', { header: 'Placa' }),
  columnHelper.accessor('observation', { header: 'Observação' }),
]

/** Rótulos do consumidor (a tabela não embute texto de nenhum idioma). */
const expandLabels = { expand: 'Expand', collapse: 'Collapse' }

/**
 * Botões do chevron, buscados pelos rótulos que o consumidor passou.
 *
 * Busca pelo DOM e não por `getAllByRole('button')`: a linha clicável também
 * expõe `role="button"` e o nome acessível dela inclui o rótulo do chevron.
 *
 * @param labels Rótulos esperados no `aria-label` (default: o do cenário).
 * @returns Botões de expandir/recolher na ordem das linhas.
 */
function getExpanderButtons(labels = expandLabels): HTMLButtonElement[] {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      `td button[aria-label="${labels.expand}"], td button[aria-label="${labels.collapse}"]`,
    ),
  )
}

/** Props mínimas da tabela (server-side: página 0, 10 por página). */
const baseProps = {
  data: rows,
  columns,
  total: rows.length,
  pageIndex: 0,
  pageSize: 10,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
}

/** Renderiza a tabela sem expansão (só as props comuns). */
function renderTable(overrides: Partial<GenericTableCommonProps<Row>> = {}) {
  return render(<GenericTable<Row> {...baseProps} {...overrides} />)
}

/** Sub-conteúdo padrão da linha expandida. */
const expandedObservation = (row: Row) => <p>obs: {row.observation ?? 'sem obs'}</p>

/**
 * Elemento da tabela expansível.
 *
 * O par linha expandida + rótulos vai sempre **completo** — é o que o tipo do
 * componente exige (não há rótulo embutido para cair de fallback).
 *
 * @param overrides Props comuns sobrescritas.
 * @param expansion Conteúdo da linha e rótulos (defaults do cenário).
 * @returns Elemento pronto para `render`/`rerender`.
 */
function expandableTable(
  overrides: Partial<GenericTableCommonProps<Row>> = {},
  expansion: { labels?: TableExpandLabels; renderRow?: (row: Row) => ReactNode } = {},
) {
  return (
    <GenericTable<Row>
      {...baseProps}
      {...overrides}
      getRowKey={(row) => row.id}
      renderExpandedRow={expansion.renderRow ?? expandedObservation}
      expandLabels={expansion.labels ?? expandLabels}
    />
  )
}

describe('GenericTable — linha expansível (opt-in)', () => {
  it('sem renderExpandedRow não há botão de expandir (comportamento antigo)', () => {
    renderTable()

    expect(getExpanderButtons()).toHaveLength(0)
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1)
  })

  it('expande e recolhe a linha mostrando o sub-conteúdo', () => {
    render(expandableTable())

    const [firstToggle] = getExpanderButtons()
    expect(firstToggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(firstToggle)

    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
    // Quando expandida, o botão daquela linha vira "Recolher".
    expect(getExpanderButtons().map((button) => button.getAttribute('aria-label'))).toEqual([
      'Collapse',
      'Expand',
    ])
    // Linha expandida + cabeçalho + 2 linhas.
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 2)

    fireEvent.click(getExpanderButtons()[0])
    expect(screen.queryByText('obs: Motorista sem vínculo')).toBeNull()
    expect(getExpanderButtons()).toHaveLength(rows.length)
  })

  it('mantém a expansão correta quando a lista ganha um item no topo', () => {
    const { rerender } = render(expandableTable())

    // Expande a 2ª linha (sem observação).
    fireEvent.click(getExpanderButtons()[1])
    expect(screen.getByText('obs: sem obs')).toBeTruthy()

    // Chega um registro novo no topo entre dois refetches (o polling de 15s).
    rerender(
      expandableTable({
        data: [{ id: 'r0', plate: 'NEW1A23', observation: 'novo' }, ...rows],
        total: rows.length + 1,
      }),
    )

    // A expansão continua na **mesma** linha (chave estável), não no índice.
    expect(screen.getByText('obs: sem obs')).toBeTruthy()
  })

  it('sem onRowClick a linha inteira alterna a expansão', () => {
    render(expandableTable())

    fireEvent.click(screen.getByText('ABC1D23'))
    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
  })

  it('com onRowClick só o botão expande (o clique na linha segue sendo a ação)', () => {
    const onRowClick = vi.fn()
    render(expandableTable({ onRowClick }))

    fireEvent.click(screen.getByText('ABC1D23'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
    expect(screen.queryByText('obs: Motorista sem vínculo')).toBeNull()

    fireEvent.click(getExpanderButtons()[0])
    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
  })

  it('usa os rótulos do consumidor (nenhum texto embutido no componente)', () => {
    const labels = { expand: 'Desdobrar linha', collapse: 'Recolher linha' }

    render(expandableTable({}, { labels }))

    const [firstToggle] = getExpanderButtons(labels)
    expect(firstToggle.getAttribute('aria-label')).toBe('Desdobrar linha')
    // Os rótulos em português que o componente trazia embutidos não existem mais.
    expect(document.querySelector('button[aria-label="Expandir"]')).toBeNull()
    expect(document.querySelector('button[aria-label="Recolher"]')).toBeNull()

    fireEvent.click(firstToggle)
    expect(getExpanderButtons(labels)[0].getAttribute('aria-label')).toBe('Recolher linha')
  })

  it('expansão sem rótulos não compila (e não renderiza o controle)', () => {
    render(
      // @ts-expect-error — o tipo exige `expandLabels` junto de `renderExpandedRow`.
      <GenericTable<Row> {...baseProps} renderExpandedRow={expandedObservation} />,
    )

    expect(getExpanderButtons()).toHaveLength(0)
  })
})
