// React
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

// i18n (instância real: é o que prova o idioma de ponta a ponta na ficha)
import i18n from '#/shared/i18n'

// Component
import { AccessVerdictCard } from './access-verdict-card'

// Types
import type { AccessContextResponse } from '../types/access.types'

/**
 * Ficha mínima da placa: negativa por bloqueio, que é o caso com mais texto e
 * com data (o `Desde {{date}}` do bloqueio) na tela.
 *
 * @param overrides Campos sobrescritos no cenário.
 * @returns Contexto completo.
 */
function buildContext(overrides: Partial<AccessContextResponse> = {}): AccessContextResponse {
  return {
    plate: 'ABC1D23',
    verdict: 'DENY_BLOCKED',
    reasons: ['BLOCKED'],
    requiresRequest: false,
    reusableRequestId: null,
    requiresOverCapacity: false,
    isReentry: false,
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC1D23',
      model: 'Onix',
      color: 'Prata',
      vehicleTypeId: 'type-1',
      vehicleType: null,
      freePass: false,
      isActive: true,
      isBlocked: true,
    },
    block: {
      id: 'block-1',
      reason: 'Documentação irregular',
      blockType: 'MANUAL',
      blockedAt: '2026-09-01T10:00:00.000Z',
    },
    department: {
      id: 'department-1',
      name: 'Recepção',
      defaultId: 'department-1',
      defaultName: 'Recepção',
      capacity: 10,
      occupied: 3,
      hasFreeSlot: true,
    },
    drivers: { linked: [], suggestions: [], search: null },
    requests: [],
    openAccesses: [],
    ...overrides,
  }
}

afterEach(async () => {
  // O i18n é o singleton da aplicação (e a lib de data/hora lê o idioma dele):
  // devolve o idioma ao padrão do ambiente para não vazar entre casos.
  await i18n.changeLanguage('en')
})

describe('AccessVerdictCard — idioma da ficha', () => {
  it('mostra o veredito e os rótulos no idioma ativo (português)', async () => {
    await i18n.changeLanguage('pt')

    render(<AccessVerdictCard context={buildContext()} />)

    // O rótulo do veredito é refinado pelo motivo (`DENY_BLOCKED` + `BLOCKED`).
    expect(screen.getByText('Veículo bloqueado')).toBeTruthy()
    expect(screen.getByText('Veículo')).toBeTruthy()

    // A linha do bloqueio junta rótulo, motivo e data (daí a busca pelo span).
    const blockLabel = screen.getByText('Bloqueio ativo:')
    expect(blockLabel.parentElement?.textContent).toMatch(/Desde \d{2}\/\d{2}\/\d{4}/)
  })

  it('mostra a ficha inteira em espanhol, inclusive a data', async () => {
    await i18n.changeLanguage('es')

    render(<AccessVerdictCard context={buildContext()} />)

    expect(screen.getByText('Vehículo bloqueado')).toBeTruthy()
    expect(screen.getByText('Vehículo')).toBeTruthy()

    const blockLabel = screen.getByText('Bloqueo activo:')
    expect(blockLabel.parentElement?.textContent).toMatch(/Desde \d{2}\/\d{2}\/\d{4}/)

    // Rótulos em português não aparecem quando o idioma é espanhol.
    expect(screen.queryByText('Bloqueio ativo:')).toBeNull()
    expect(screen.queryByText('Veículo bloqueado')).toBeNull()
  })
})
