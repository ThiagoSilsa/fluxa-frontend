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

  describe('com grupos rotulados', () => {
    const linked: SearchPickerOption[] = Array.from({ length: 3 }, (_, index) => ({
      id: `linked-${index + 1}`,
      primary: `Vinculado ${index + 1}`,
    }))
    const suggestions: SearchPickerOption[] = Array.from({ length: 7 }, (_, index) => ({
      id: `sugg-${index + 1}`,
      primary: `Sugestão ${index + 1}`,
      secondary: 'sem vínculo',
    }))

    /** Grupos montados **inline** (nova identidade a cada render — caso real). */
    const renderGrouped = (overrides: Partial<SearchPickerProps> = {}) =>
      renderPicker({
        options: undefined,
        groups: [
          { label: 'Vinculados', options: linked },
          { label: 'Sugestões', options: suggestions },
        ],
        ...overrides,
      })

    it('renderiza os rótulos dos grupos seguidos das opções', () => {
      renderGrouped()
      fireEvent.focus(screen.getByLabelText('Veículo'))

      const listbox = screen.getByRole('listbox')
      const labels = Array.from(listbox.querySelectorAll('[role="presentation"]'))
      expect(labels.map((label) => label.textContent)).toEqual(['Vinculados', 'Sugestões'])
      // Rótulo é apenas visual: não recebe foco nem conta como opção.
      labels.forEach((label) => expect(label.getAttribute('tabindex')).toBeNull())
      expect(screen.getAllByRole('option')).toHaveLength(3 + SEARCH_PICKER_MAX_OPTIONS)
      // As opções vêm depois do rótulo do próprio grupo.
      expect(labels[0].nextElementSibling?.textContent).toContain('Vinculado 1')
      expect(labels[1].nextElementSibling?.textContent).toContain('Sugestão 1')
    })

    it('aplica maxOptions por grupo (cada grupo corta no limite)', () => {
      renderGrouped({ maxOptions: 2 })
      fireEvent.focus(screen.getByLabelText('Veículo'))

      const renderedOptions = screen.getAllByRole('option')
      expect(renderedOptions).toHaveLength(4)
      expect(renderedOptions.map((option) => option.textContent)).toEqual([
        expect.stringContaining('Vinculado 1'),
        expect.stringContaining('Vinculado 2'),
        expect.stringContaining('Sugestão 1'),
        expect.stringContaining('Sugestão 2'),
      ])
    })

    it('navega com o teclado atravessando os grupos (ida e volta)', () => {
      renderGrouped()
      const input = screen.getByLabelText('Veículo')

      fireEvent.focus(input)

      // Do último item de "Vinculados" para o primeiro de "Sugestões".
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(input.getAttribute('aria-activedescendant')).toBe('picker-group-1-option-sugg-1')
      expect(screen.getAllByRole('option')[3].getAttribute('aria-selected')).toBe('true')

      // Do primeiro de "Sugestões" de volta para o último de "Vinculados".
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(input.getAttribute('aria-activedescendant')).toBe('picker-group-0-option-linked-3')
    })

    it('dá a volta do último item visível para o primeiro com ArrowDown', () => {
      renderGrouped()
      const input = screen.getByLabelText('Veículo')

      fireEvent.focus(input)
      // O 1º ArrowDown destaca o 1º item; o último dá a volta.
      const total = 3 + SEARCH_PICKER_MAX_OPTIONS
      for (let step = 0; step < total + 1; step += 1) {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      }

      expect(input.getAttribute('aria-activedescendant')).toBe('picker-group-0-option-linked-1')
    })

    it('mantém o destaque ao re-renderizar com grupos recriados inline', () => {
      const { rerender } = render(
        <SearchPicker
          id="picker"
          label="Motorista"
          searchPlaceholder="Buscar"
          noResultsLabel="Nada encontrado"
          selectedLabel="Selecionado"
          value=""
          onChange={vi.fn()}
          search=""
          onSearchChange={vi.fn()}
          groups={[
            { label: 'Vinculados', options: linked },
            { label: 'Sugestões', options: suggestions },
          ]}
          isPending={false}
        />,
      )

      const input = screen.getByLabelText('Motorista')
      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // O consumidor recria os arrays a cada render: o destaque não pode voltar
      // para o primeiro item.
      rerender(
        <SearchPicker
          id="picker"
          label="Motorista"
          searchPlaceholder="Buscar"
          noResultsLabel="Nada encontrado"
          selectedLabel="Selecionado"
          value=""
          onChange={vi.fn()}
          search=""
          onSearchChange={vi.fn()}
          groups={[
            { label: 'Vinculados', options: [...linked] },
            { label: 'Sugestões', options: [...suggestions] },
          ]}
          isPending={false}
        />,
      )

      expect(input.getAttribute('aria-activedescendant')).toBe('picker-group-0-option-linked-2')
    })

    it('seleciona uma opção de qualquer grupo com Enter', () => {
      const { onChange, onSelectOption } = renderGrouped()
      const input = screen.getByLabelText('Veículo')

      fireEvent.focus(input)
      for (let step = 0; step < 4; step += 1) {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      }
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith('sugg-1')
      expect(onSelectOption).toHaveBeenCalledWith(suggestions[0])
    })

    it('não renderiza rótulo de grupo vazio e cai em "sem resultado"', () => {
      renderGrouped({
        groups: [
          { label: 'Vinculados', options: [] },
          { label: 'Sugestões', options: [] },
        ],
      })

      fireEvent.focus(screen.getByLabelText('Veículo'))

      expect(screen.getByText('Nada encontrado')).toBeTruthy()
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  it('mostra a etiqueta (badge) da opção quando informada', () => {
    renderPicker({
      options: [
        {
          id: 'driver-1',
          primary: 'Marina',
          badge: 'Sem permissão de dirigir',
          badgeTone: 'warning',
        },
      ],
    })
    fireEvent.focus(screen.getByLabelText('Veículo'))

    expect(screen.getByText('Sem permissão de dirigir')).toBeTruthy()
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
