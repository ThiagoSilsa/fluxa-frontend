// React
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Component
import { AccessRegisterDialog } from './access-register-dialog'

// Types
import type {
  AccessContextResponse,
  AccessEntryResponse,
  OpenAccessResponse,
} from '../types/access.types'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const contextQuery = vi.fn()
const openAccessQuery = vi.fn()
const registerEntry = { mutate: vi.fn(), isPending: false }
const registerExit = { mutate: vi.fn(), isPending: false }
const registerDenial = { mutate: vi.fn(), isPending: false }

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}))

vi.mock('../hooks/use-access-context-query', () => ({
  useAccessContextQuery: (params: unknown) => contextQuery(params),
}))

vi.mock('../hooks/use-open-access-query', () => ({
  useOpenAccessQuery: (plate: unknown) => openAccessQuery(plate),
}))

vi.mock('../hooks/use-access-mutations', () => ({
  useAccessMutations: () => ({ registerEntry, registerExit, registerDenial }),
}))

// O QR é um diálogo próprio (com query real) — mockado para não exigir provider.
vi.mock('./qr-resolve-dialog', () => ({
  QrResolveDialog: ({ open }: { open: boolean }) => (open ? <p>qr-dialog-open</p> : null),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const permissions = ['REGISTER_ENTRY', 'REGISTER_EXIT', 'REGISTER_DENIAL']

/**
 * Ficha da placa (contexto) com os blocos usados pelo modal.
 *
 * @param overrides Campos sobrescritos no cenário.
 * @returns Contexto completo.
 */
function buildContext(overrides: Partial<AccessContextResponse> = {}): AccessContextResponse {
  return {
    plate: 'ABC1D23',
    verdict: 'ALLOW',
    reasons: ['DRIVER_ALLOWED'],
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
      vehicleType: { id: 'type-1', code: 'FROTA', name: 'Frota', isFleet: true },
      freePass: false,
      isActive: true,
      isBlocked: false,
    },
    block: null,
    department: {
      id: 'department-1',
      name: 'Recepção',
      defaultId: 'department-1',
      defaultName: 'Recepção',
      capacity: 10,
      occupied: 3,
      hasFreeSlot: true,
    },
    drivers: {
      linked: [{ id: 'driver-1', name: 'Marina', linked: true, canDrive: true, isPrimary: true }],
      suggestions: [],
      search: null,
    },
    requests: [],
    openAccesses: [],
    ...overrides,
  }
}

/** Resultado do hook de contexto (shape do `useQuery`). */
function loadedContext(context: AccessContextResponse) {
  return { data: context, isPending: false, isError: false }
}

const openAccess: OpenAccessResponse = {
  id: 'access-1',
  vehicleId: 'vehicle-1',
  temporaryPlate: null,
  driver: { id: 'driver-1', name: 'Marina', phone: '11999999999' },
  departmentId: 'department-1',
  departmentName: 'Recepção',
  vehicle: {
    id: 'vehicle-1',
    plate: 'ABC1D23',
    model: 'Onix',
    color: 'Prata',
    vehicleType: { id: 'type-1', code: 'FROTA', name: 'Frota', isFleet: true },
    freePass: false,
  },
  entryAt: '2026-09-12T10:00:00.000Z',
  overCapacity: false,
}

/**
 * Renderiza o modal já aberto e busca a placa (chega no passo da ficha).
 *
 * @param context Ficha devolvida pelo contexto.
 * @param options Ajustes do cenário (placa, acesso aberto, permissões).
 */
function renderDialog(
  context: AccessContextResponse,
  options: { plate?: string; openAccess?: OpenAccessResponse[]; permissions?: string[] } = {},
) {
  contextQuery.mockReturnValue(loadedContext(context))
  openAccessQuery.mockReturnValue({
    data: { data: options.openAccess ?? [] },
    isPending: false,
  })

  render(
    <AccessRegisterDialog
      open
      onOpenChange={vi.fn()}
      permissions={options.permissions ?? permissions}
      entranceId="entrance-1"
    />,
  )

  fireEvent.change(screen.getByLabelText('register.plate.label'), {
    target: { value: options.plate ?? 'ABC1D23' },
  })
  fireEvent.keyDown(screen.getByLabelText('register.plate.label'), { key: 'Enter' })
}

beforeEach(() => {
  vi.clearAllMocks()
  // Defaults: ficha ainda não consultada e nenhum acesso aberto.
  contextQuery.mockReturnValue({ data: undefined, isPending: false, isError: false })
  openAccessQuery.mockReturnValue({ data: { data: [] }, isPending: false })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AccessRegisterDialog', () => {
  it('valida a placa antes de consultar a ficha', () => {
    contextQuery.mockReturnValue({ data: undefined, isPending: false, isError: false })
    render(<AccessRegisterDialog open onOpenChange={vi.fn()} permissions={permissions} />)

    fireEvent.change(screen.getByLabelText('register.plate.label'), {
      target: { value: 'ABC' },
    })
    fireEvent.keyDown(screen.getByLabelText('register.plate.label'), { key: 'Enter' })

    expect(screen.getByText('register.plate.invalid')).toBeTruthy()
    expect(contextQuery).toHaveBeenCalledWith(null)
  })

  it('mostra o veredito de liberação com o rótulo refinado e a ficha do veículo', () => {
    renderDialog(buildContext())

    expect(screen.getByText('verdict.reasons.ALLOW.DRIVER_ALLOWED')).toBeTruthy()
    expect(screen.getByText('verdict.reasonNames.DRIVER_ALLOWED')).toBeTruthy()
    // A placa aparece no resumo e na linha do veículo da ficha.
    expect(screen.getAllByText('ABC1D23').length).toBeGreaterThan(0)
    // O setor aparece no resumo e na linha do setor da ficha.
    expect(screen.getAllByText('Recepção').length).toBeGreaterThan(0)
    // O motorista aparece na lista da ficha e no select (pré-selecionado).
    expect(screen.getAllByText('Marina').length).toBeGreaterThan(0)
    expect(screen.getByText('register.actions.release')).toBeTruthy()
  })

  it('mostra a ficha da exceção quando a entrada precisa de solicitação', () => {
    renderDialog(
      buildContext({
        verdict: 'ALLOW_WITH_REQUEST',
        reasons: ['DRIVER_NOT_ALLOWED', 'UNREGISTERED_DRIVER'],
        requiresRequest: true,
        drivers: {
          linked: [
            { id: 'driver-2', name: 'Jonas', linked: true, canDrive: false, isPrimary: true },
          ],
          suggestions: [],
          search: null,
        },
      }),
    )

    expect(screen.getByText('verdict.reasons.ALLOW_WITH_REQUEST.DRIVER_NOT_ALLOWED')).toBeTruthy()
    expect(screen.getByText('register.request.create')).toBeTruthy()
    expect(screen.getByText('register.driver.label')).toBeTruthy()
  })

  it('avisa bloqueio ativo no veredito de negativa', () => {
    renderDialog(
      buildContext({
        verdict: 'DENY_BLOCKED',
        reasons: ['BLOCKED'],
        block: {
          id: 'block-1',
          reason: 'Documentação irregular',
          blockType: 'MANUAL',
          blockedAt: '2026-09-01T10:00:00.000Z',
        },
      }),
    )

    expect(screen.getByText('verdict.reasons.DENY_BLOCKED.BLOCKED')).toBeTruthy()
    expect(screen.getByText('Documentação irregular', { exact: false })).toBeTruthy()
    // Ação principal da negativa é registrar o impedimento.
    expect(screen.getByText('register.actions.denial')).toBeTruthy()
  })

  it('infere a saída quando a placa já está dentro (e busca quem entrou)', () => {
    renderDialog(buildContext({ openAccesses: [{ ...openAccess }] }), {
      openAccess: [openAccess],
    })

    expect(openAccessQuery).toHaveBeenCalledWith('ABC1D23')
    expect(screen.getByText('Marina', { exact: false })).toBeTruthy()
    expect(screen.getByText('register.actions.exit')).toBeTruthy()
  })

  it('pede confirmação de vaga cheia e envia overCapacity', async () => {
    registerEntry.mutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ granted: true, message: 'Entrada registrada.' })
    })

    renderDialog(buildContext({ requiresOverCapacity: true, verdict: 'ALLOW_OVER_CAPACITY' }))

    fireEvent.click(screen.getByText('register.actions.release'))

    // Confirmação antes de exceder a capacidade.
    expect(screen.getByText('register.confirm.overCapacity.title')).toBeTruthy()
    fireEvent.click(screen.getByText('register.confirm.overCapacity.confirm'))

    await waitFor(() => {
      expect(registerEntry.mutate).toHaveBeenCalled()
    })
    const payload = registerEntry.mutate.mock.calls[0][0]
    expect(payload).toMatchObject({
      plate: 'ABC1D23',
      overCapacity: true,
      driverUserId: 'driver-1',
      departmentId: 'department-1',
      entranceId: 'entrance-1',
    })
  })

  it('pede confirmação de reentrada antes de liberar', () => {
    const context = buildContext({ isReentry: true, verdict: 'ALLOW_FORCED_REENTRY' })
    renderDialog({ ...context, openAccesses: [{ ...openAccess }] })

    // A ficha infere saída (placa INSIDE); o porteiro força a entrada.
    fireEvent.click(screen.getByText('register.type.ENTRY'))
    fireEvent.click(screen.getByText('register.actions.release'))

    expect(screen.getByText('register.confirm.reentry.title')).toBeTruthy()
    fireEvent.click(screen.getByText('register.confirm.reentry.confirm'))

    expect(registerEntry.mutate).toHaveBeenCalled()
    expect(registerEntry.mutate.mock.calls[0][0].overCapacity).toBeUndefined()
  })

  it('libera entrada com solicitação reaproveitável usando accessRequestId', () => {
    renderDialog(
      buildContext({
        verdict: 'ALLOW_WITH_REQUEST',
        reasons: ['REQUEST_OPEN'],
        requiresRequest: true,
        reusableRequestId: 'request-1',
      }),
    )

    fireEvent.click(screen.getByText('register.actions.release'))

    const payload = registerEntry.mutate.mock.calls[0][0]
    expect(payload.accessRequestId).toBe('request-1')
    expect(payload.request).toBeUndefined()
  })

  it('registra o impedimento com o motivo sugerido pela negativa', () => {
    registerDenial.mutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ id: 'denial-1' })
    })

    renderDialog(buildContext({ verdict: 'DENY_BLOCKED', reasons: ['BLOCKED'] }))

    fireEvent.click(screen.getAllByText('register.actions.denial')[0])
    expect(screen.getByText('register.denial.title')).toBeTruthy()

    // Agora o único botão com esse rótulo é o do formulário.
    fireEvent.click(screen.getByText('register.actions.denial'))

    const payload = registerDenial.mutate.mock.calls[0][0]
    expect(payload).toMatchObject({
      plate: 'ABC1D23',
      reason: 'BLOCKED',
      vehicleId: 'vehicle-1',
      entranceId: 'entrance-1',
    })
  })

  it('mostra o resultado inline e volta para a placa em "Registrar outro"', async () => {
    const entryResult: AccessEntryResponse = {
      granted: true,
      message: 'Entrada registrada.',
    }
    registerEntry.mutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.(entryResult)
    })

    renderDialog(buildContext())

    fireEvent.click(screen.getByText('register.actions.release'))

    await waitFor(() => {
      expect(screen.getByText('register.result.entry.granted')).toBeTruthy()
    })
    expect(screen.getByText('Entrada registrada.')).toBeTruthy()

    fireEvent.click(screen.getByText('register.actions.another'))

    // Volta ao passo da placa, limpo.
    const plateInput = screen.getByLabelText<HTMLInputElement>('register.plate.label')
    expect(plateInput.value).toBe('')
    expect(screen.queryByText('register.result.entry.granted')).toBeNull()
  })

  it('não oferece o toggle de tipo quando o porteiro só pode registrar entrada', () => {
    renderDialog(buildContext(), { permissions: ['REGISTER_ENTRY'] })

    expect(screen.queryByText('register.type.EXIT')).toBeNull()
    expect(screen.queryByText('register.type.DENIAL')).toBeNull()
    expect(screen.getByText('register.actions.release')).toBeTruthy()
  })
})
