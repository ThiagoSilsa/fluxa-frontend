// React
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Component
import { AccessDriverPicker } from './access-driver-picker'

// Types
import type { AccessContextDriver } from '../types/access.types'

// O Popper do Radix observa tamanho via ResizeObserver (ausente no jsdom).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}))

const linked: AccessContextDriver[] = [
  { id: 'driver-1', name: 'Marina', linked: true, canDrive: true, isPrimary: true },
  { id: 'driver-2', name: 'Jonas', linked: true, canDrive: false, isPrimary: false },
]

const suggestions: AccessContextDriver[] = [
  { id: 'driver-3', name: 'Paula', linked: false, canDrive: false, isPrimary: false },
]

/**
 * Renderiza o picker de condutores.
 *
 * @param overrides Props sobrescritas no cenário.
 * @returns Callbacks espionados.
 */
function renderPicker(overrides: Partial<Parameters<typeof AccessDriverPicker>[0]> = {}) {
  const onChange = vi.fn()
  const onSearchChange = vi.fn()
  const onNewDriver = vi.fn()

  render(
    <AccessDriverPicker
      linked={linked}
      suggestions={suggestions}
      value=""
      onChange={onChange}
      search=""
      onSearchChange={onSearchChange}
      isPending={false}
      onNewDriver={onNewDriver}
      {...overrides}
    />,
  )

  return { onChange, onSearchChange, onNewDriver }
}

describe('AccessDriverPicker', () => {
  it('agrupa vinculados e sugestões e etiqueta cada estado de vínculo', () => {
    renderPicker()
    fireEvent.focus(screen.getByLabelText('register.driver.label'))

    expect(screen.getByText('register.driver.linked')).toBeTruthy()
    expect(screen.getByText('register.driver.suggestions')).toBeTruthy()
    expect(screen.getByText('Marina')).toBeTruthy()
    expect(screen.getByText('Jonas')).toBeTruthy()
    expect(screen.getByText('Paula')).toBeTruthy()
    // Marina está vinculada e autorizada a dirigir.
    expect(screen.getByText('verdict.drivers.linked')).toBeTruthy()
    // Jonas está vinculado mas sem permissão de dirigir.
    expect(screen.getByText('verdict.drivers.noPermission')).toBeTruthy()
    // Paula é uma sugestão (pessoa da empresa sem vínculo).
    expect(screen.getByText('verdict.drivers.notLinked')).toBeTruthy()
  })

  it('limita cada grupo a 3 opções (3 vinculados + 3 sugestões)', () => {
    const many: AccessContextDriver[] = Array.from({ length: 5 }, (_, index) => ({
      id: `extra-${index}`,
      name: `Extra ${index}`,
      linked: true,
      canDrive: true,
      isPrimary: false,
    }))

    renderPicker({ linked: many, suggestions: [] })
    fireEvent.focus(screen.getByLabelText('register.driver.label'))

    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('seleciona um condutor do grupo', () => {
    const { onChange } = renderPicker()
    fireEvent.focus(screen.getByLabelText('register.driver.label'))

    fireEvent.click(screen.getByText('Marina'))

    expect(onChange).toHaveBeenCalledWith('driver-1')
  })

  it('reporta a busca digitada (o modal consulta o contexto com `search`)', () => {
    const { onSearchChange } = renderPicker()
    const input = screen.getByLabelText('register.driver.label')

    fireEvent.change(input, { target: { value: '98888' } })

    expect(onSearchChange).toHaveBeenCalledWith('98888')
  })

  it('abre o cadastro de condutor novo', () => {
    const { onNewDriver } = renderPicker()

    fireEvent.click(screen.getByText('register.driver.new'))

    expect(onNewDriver).toHaveBeenCalled()
  })

  it('esconde o atalho de condutor novo quando o formulário está aberto', () => {
    renderPicker({ hideNewDriver: true })

    expect(screen.queryByText('register.driver.new')).toBeNull()
  })
})
