// React
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Component
import { FormDialog } from './form-dialog'
import { SEARCH_PICKER_MAX_OPTIONS, SearchPicker } from './search-picker'
import type { SearchPickerOption, SearchPickerProps } from './search-picker'

// O Popper do Radix observa tamanho via ResizeObserver (ausente no jsdom).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)

const options: SearchPickerOption[] = Array.from({ length: 7 }, (_, index) => ({
  id: `veh-${index + 1}`,
  primary: `ABC1D2${index}`,
  secondary: 'Onix',
  uppercasePrimary: true,
}))

type RenderPickerResult = {
  onChange: ReturnType<typeof vi.fn>
  onSearchChange: ReturnType<typeof vi.fn>
  onSelectOption: ReturnType<typeof vi.fn>
  container: HTMLElement
}

function renderPicker(overrides: Partial<SearchPickerProps> = {}): RenderPickerResult {
  const onChange = vi.fn()
  const onSearchChange = vi.fn()
  const onSelectOption = vi.fn()

  const { container } = render(
    <SearchPicker
      id="picker"
      label="Veículo"
      searchPlaceholder="Buscar placa"
      noResultsLabel="Nada encontrado"
      selectedLabel="Selecionado"
      value=""
      onChange={onChange}
      search=""
      onSearchChange={onSearchChange}
      options={options}
      isPending={false}
      onSelectOption={onSelectOption}
      {...overrides}
    />,
  )

  return { onChange, onSearchChange, onSelectOption, container }
}

describe('SearchPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abre a lista em Popover (portal), sem reservar espaço no fluxo', () => {
    const { container } = renderPicker()

    const input = screen.getByLabelText('Veículo')
    fireEvent.focus(input)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeTruthy()
    expect(listbox.getAttribute('aria-label')).toBe('Veículo')
    // Renderizada em portal (fora do container do componente) → sobreposta.
    expect(container.querySelector('[role="listbox"]')).toBeNull()
    // Largura do Popover acompanha o input (medida do anchor).
    expect(document.querySelector('[data-slot="popover-content"]')?.className).toContain(
      'w-(--radix-popover-trigger-width)',
    )
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-controls')).toBe('picker-listbox')
    expect(input.getAttribute('role')).toBe('combobox')
  })

  it(`limita as opções renderizadas a maxOptions (default ${SEARCH_PICKER_MAX_OPTIONS})`, () => {
    renderPicker()
    fireEvent.focus(screen.getByLabelText('Veículo'))

    expect(screen.getAllByRole('option')).toHaveLength(SEARCH_PICKER_MAX_OPTIONS)

    const listbox = screen.getByRole('listbox')
    expect(listbox.className).toContain('overflow-auto')
    expect(listbox.className).toContain('max-h-56')
  })

  it('respeita um maxOptions customizado', () => {
    renderPicker({ maxOptions: 2 })
    fireEvent.focus(screen.getByLabelText('Veículo'))

    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('seleciona com clique, mostra o chip e limpa a seleção', () => {
    const { onChange, onSearchChange, onSelectOption } = renderPicker()

    fireEvent.focus(screen.getByLabelText('Veículo'))
    fireEvent.click(screen.getByRole('option', { name: /ABC1D20/ }))

    expect(onChange).toHaveBeenCalledWith('veh-1')
    expect(onSearchChange).toHaveBeenCalledWith('')
    expect(onSelectOption).toHaveBeenCalledWith(options[0])

    // Chip da seleção (o input sai de cena) e a lista fecha.
    expect(screen.getByText('Selecionado')).toBeTruthy()
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByLabelText('Veículo')).toBeTruthy()
  })

  it('navega com ArrowDown/ArrowUp e seleciona com Enter', () => {
    const { onChange } = renderPicker()
    const input = screen.getByLabelText('Veículo')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const rendered = screen.getAllByRole('option')
    expect(rendered[0].getAttribute('aria-selected')).toBe('false')
    expect(rendered[1].getAttribute('aria-selected')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe('picker-option-veh-2')

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('veh-2')
  })

  it('volta para a última opção visível com ArrowUp no primeiro item', () => {
    renderPicker()
    const input = screen.getByLabelText('Veículo')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    const rendered = screen.getAllByRole('option')
    expect(rendered[SEARCH_PICKER_MAX_OPTIONS - 1].getAttribute('aria-selected')).toBe('true')
  })

  it('fecha com Escape', () => {
    renderPicker()
    const input = screen.getByLabelText('Veículo')

    fireEvent.focus(input)
    expect(screen.queryByRole('listbox')).toBeTruthy()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('abre ao digitar e mantém o foco no input (o Popover não rouba o foco)', () => {
    const { onSearchChange } = renderPicker()
    const input = screen.getByLabelText('Veículo')

    input.focus()
    fireEvent.change(input, { target: { value: 'ABC' } })

    expect(onSearchChange).toHaveBeenCalledWith('ABC')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(document.activeElement).toBe(input)
  })

  it('mantém carregando/vazio dentro do Popover, sem lista', () => {
    renderPicker({ options: [], isPending: true })

    fireEvent.focus(screen.getByLabelText('Veículo'))

    expect(screen.getByText('Nada encontrado')).toBeTruthy()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('preserva aria-invalid e aria-describedby no input', () => {
    renderPicker({ invalid: true, ariaDescribedBy: 'picker-error' })

    const input = screen.getByLabelText('Veículo')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('picker-error')
  })

  it('não é recortado pelo overflow do FormDialog (Popover em portal)', () => {
    const onChange = vi.fn()

    render(
      <FormDialog
        open
        onOpenChange={vi.fn()}
        title="Nova solicitação"
        description="Preencha os dados"
      >
        <SearchPicker
          id="picker"
          label="Veículo"
          searchPlaceholder="Buscar placa"
          noResultsLabel="Nada encontrado"
          selectedLabel="Selecionado"
          value=""
          onChange={onChange}
          search=""
          onSearchChange={vi.fn()}
          options={options}
          isPending={false}
        />
      </FormDialog>,
    )

    // O FormDialog foca o primeiro campo ao abrir → o Popover já está aberto.
    const input = screen.getByRole('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('true')

    const listbox = screen.getByRole('listbox')
    const dialogPanel = document.querySelector('[data-slot="dialog-content"]')

    expect(dialogPanel).toBeTruthy()
    expect(dialogPanel?.contains(listbox)).toBe(false)
    expect(document.body.contains(listbox)).toBe(true)
  })
})
