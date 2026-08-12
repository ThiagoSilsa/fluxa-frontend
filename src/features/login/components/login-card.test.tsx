// React
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Component
import { LoginCard } from './login-card'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockHandleSubmit = vi.fn()

vi.mock('../hooks/use-login-handlers', () => ({
  useLoginHandlers: () => ({
    handleSubmit: (...args: unknown[]) => mockHandleSubmit(...args),
    isSubmitting: false,
    authError: null,
    clearAuthError: vi.fn(),
    companies: null,
    chooseCompany: vi.fn(),
    cancelCompanyChoice: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginCard', () => {
  it('renderiza os campos de e-mail, senha e o botão de entrar', () => {
    render(<LoginCard />)

    expect(screen.getByLabelText('form.emailLabel')).toBeDefined()
    expect(screen.getByLabelText('form.passwordLabel')).toBeDefined()
    expect(screen.getByRole('button', { name: 'form.submit' })).toBeDefined()
  })

  it('submete o formulário com os valores digitados', async () => {
    render(<LoginCard />)

    fireEvent.change(screen.getByLabelText('form.emailLabel'), {
      target: { value: 'user@co.com' },
    })
    fireEvent.change(screen.getByLabelText('form.passwordLabel'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'form.submit' }))

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith(
        { email: 'user@co.com', password: '123' },
        expect.anything(),
      )
    })
  })
})
