// React
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// TanStack Table
import { createColumnHelper } from '@tanstack/react-table'

// Component
import { GenericTable } from './generic-table'

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

/**
 * Botões do chevron.
 *
 * Busca pelo DOM e não por `getAllByRole('button')`: a linha clicável também
 * expõe `role="button"` e o nome acessível dela inclui o rótulo do chevron.
 *
 * @returns Botões de expandir/recolher na ordem das linhas.
 */
function getExpanderButtons(): HTMLButtonElement[] {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      'td button[aria-label="Expandir"], td button[aria-label="Recolher"]',
    ),
  )
}

/** Props mínimas da tabela (server-side: página 0, 10 por página). */
function renderTable(overrides: Partial<Parameters<typeof GenericTable<Row>>[0]> = {}) {
  return render(
    <GenericTable<Row>
      data={rows}
      columns={columns}
      total={rows.length}
      pageIndex={0}
      pageSize={10}
      onPageChange={vi.fn()}
      onPageSizeChange={vi.fn()}
      {...overrides}
    />,
  )
}

describe('GenericTable — linha expansível (opt-in)', () => {
  it('sem renderExpandedRow não há botão de expandir (comportamento antigo)', () => {
    renderTable()

    expect(getExpanderButtons()).toHaveLength(0)
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1)
  })

  it('expande e recolhe a linha mostrando o sub-conteúdo', () => {
    renderTable({
      renderExpandedRow: (row) => <p>obs: {row.observation ?? 'sem obs'}</p>,
      getRowKey: (row) => row.id,
      expandLabels: { expand: 'Expandir', collapse: 'Recolher' },
    })

    const [firstToggle] = getExpanderButtons()
    expect(firstToggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(firstToggle)

    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
    // Quando expandida, o botão daquela linha vira "Recolher".
    expect(getExpanderButtons().map((button) => button.getAttribute('aria-label'))).toEqual([
      'Recolher',
      'Expandir',
    ])
    // Linha expandida + cabeçalho + 2 linhas.
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 2)

    fireEvent.click(getExpanderButtons()[0])
    expect(screen.queryByText('obs: Motorista sem vínculo')).toBeNull()
    expect(getExpanderButtons()).toHaveLength(rows.length)
  })

  it('mantém a expansão correta quando a lista ganha um item no topo', () => {
    const expandable = {
      renderExpandedRow: (row: Row) => <p>obs: {row.observation ?? 'sem obs'}</p>,
      getRowKey: (row: Row) => row.id,
      expandLabels: { expand: 'Expandir', collapse: 'Recolher' },
    }
    const { rerender } = renderTable(expandable)

    // Expande a 2ª linha (sem observação).
    fireEvent.click(getExpanderButtons()[1])
    expect(screen.getByText('obs: sem obs')).toBeTruthy()

    // Chega um registro novo no topo entre dois refetches (o polling de 15s).
    rerender(
      <GenericTable<Row>
        data={[{ id: 'r0', plate: 'NEW1A23', observation: 'novo' }, ...rows]}
        columns={columns}
        total={rows.length + 1}
        pageIndex={0}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        {...expandable}
      />,
    )

    // A expansão continua na **mesma** linha (chave estável), não no índice.
    expect(screen.getByText('obs: sem obs')).toBeTruthy()
  })

  it('sem onRowClick a linha inteira alterna a expansão', () => {
    renderTable({
      renderExpandedRow: (row) => <p>obs: {row.observation ?? 'sem obs'}</p>,
      getRowKey: (row) => row.id,
      expandLabels: { expand: 'Expandir', collapse: 'Recolher' },
    })

    fireEvent.click(screen.getByText('ABC1D23'))
    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
  })

  it('com onRowClick só o botão expande (o clique na linha segue sendo a ação)', () => {
    const onRowClick = vi.fn()
    renderTable({
      onRowClick,
      renderExpandedRow: (row) => <p>obs: {row.observation ?? 'sem obs'}</p>,
      getRowKey: (row) => row.id,
      expandLabels: { expand: 'Expandir', collapse: 'Recolher' },
    })

    fireEvent.click(screen.getByText('ABC1D23'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
    expect(screen.queryByText('obs: Motorista sem vínculo')).toBeNull()

    fireEvent.click(getExpanderButtons()[0])
    expect(screen.getByText('obs: Motorista sem vínculo')).toBeTruthy()
  })
})
