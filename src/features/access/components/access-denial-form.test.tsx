// React
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Component
import { AccessDenialForm } from './access-denial-form'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}))

/**
 * Renderiza o formulário de impedimento.
 *
 * @param overrides Props sobrescritas no cenário.
 * @returns Envio espionado.
 */
function renderForm(overrides: Partial<Parameters<typeof AccessDenialForm>[0]> = {}) {
  const onSubmit = vi.fn()

  render(
    <AccessDenialForm
      initialReason="BLOCKED"
      onSubmit={onSubmit}
      isPending={false}
      {...overrides}
    />,
  )

  return { onSubmit }
}

/** Digita a observação. */
function typeObservation(value: string) {
  fireEvent.change(screen.getByLabelText('register.denial.observation.label'), {
    target: { value },
  })
}

describe('AccessDenialForm', () => {
  it('envia o impedimento com o motivo e a observação', () => {
    const { onSubmit } = renderForm()

    typeObservation('Sem autorização do setor')
    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'BLOCKED',
      observation: 'Sem autorização do setor',
      requestBlock: false,
      blockReason: '',
    })
  })

  it('exige observação somente em OTHER', () => {
    const { onSubmit } = renderForm({ initialReason: 'OTHER' })

    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('register.denial.observation.required')).toBeTruthy()

    typeObservation('Placa desconhecida na listagem')
    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'OTHER',
      observation: 'Placa desconhecida na listagem',
      requestBlock: false,
      blockReason: '',
    })
  })

  it('não oferece o bloqueio sem a permissão (CREATE_BLOCK_REQUEST)', () => {
    renderForm({ canRequestBlock: false })

    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByText('register.denial.requestBlock.label')).toBeNull()
  })

  it('começa com o pedido de bloqueio desmarcado e o motivo escondido', () => {
    renderForm({ canRequestBlock: true })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
    expect(screen.queryByLabelText('register.denial.requestBlock.reasonLabel')).toBeNull()
  })

  it('ao marcar o bloqueio, pré-preenche o motivo com a observação', () => {
    const { onSubmit } = renderForm({ canRequestBlock: true })

    typeObservation('Motorista reincidente')
    fireEvent.click(screen.getByRole('checkbox'))

    const blockReason = screen.getByLabelText<HTMLInputElement>(
      'register.denial.requestBlock.reasonLabel',
    )
    expect(blockReason.value).toBe('Motorista reincidente')

    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'BLOCKED',
      observation: 'Motorista reincidente',
      requestBlock: true,
      blockReason: 'Motorista reincidente',
    })
  })

  it('permite ajustar o motivo do bloqueio sem tocar na observação', () => {
    const { onSubmit } = renderForm({ canRequestBlock: true })

    typeObservation('Motorista reincidente')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByLabelText('register.denial.requestBlock.reasonLabel'), {
      target: { value: 'Reincidência de acesso' },
    })
    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'BLOCKED',
      observation: 'Motorista reincidente',
      requestBlock: true,
      blockReason: 'Reincidência de acesso',
    })
  })

  it('desmarcar o bloqueio descarta o motivo digitado', () => {
    const { onSubmit } = renderForm({ canRequestBlock: true })

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByLabelText('register.denial.requestBlock.reasonLabel'), {
      target: { value: 'motivo que será descartado' },
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByText('register.actions.denial'))

    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'BLOCKED',
      observation: '',
      requestBlock: false,
      blockReason: '',
    })
  })
})
