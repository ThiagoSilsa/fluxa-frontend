// React
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Page
import { PortariaPage } from './portaria-page'

// Lib
import { DEVICE_ENTRANCE_STORAGE_KEY } from '../lib/device-entrance'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const navigate = vi.fn()
const useAccessRecordsQuery = vi.fn()
let currentUser: { permissionCodes?: string[] } | null = { permissionCodes: [] }

vi.mock('@tanstack/react-router', () => ({
  getRouteApi: () => ({ useSearch: () => searchParams }),
  useNavigate: () => navigate,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}))

vi.mock('../hooks/use-access-records-query', () => ({
  useAccessRecordsQuery: (params: unknown) => useAccessRecordsQuery(params),
}))

// O modal de registro tem teste próprio (usa os hooks de contexto/mutations).
vi.mock('../components/access-register-dialog', () => ({
  AccessRegisterDialog: ({ open }: { open: boolean }) =>
    open ? <p>register-dialog-open</p> : null,
}))

vi.mock('#/app/providers/auth-provider', () => ({
  useAuth: () => ({ user: currentUser }),
}))

/** Search params correntes da rota (substituídos por caso). */
let searchParams: Record<string, unknown> = { limit: 20, offset: 0 }

const baseRecord = {
  id: 'record-1',
  kind: 'ENTRY',
  plate: 'ABC1D23',
  driverName: 'Marina',
  vehicleModel: 'Onix',
  departmentName: 'Recepção',
  entranceName: 'Portaria 1',
  doormanName: 'Porteiro',
  reason: null,
  observation: null,
  occurredAt: '2026-09-12T13:00:00.000Z',
  accessId: 'access-1',
}

/**
 * Monta o retorno do hook do feed.
 *
 * @param overrides Campos sobrescritos no resultado.
 * @returns Resultado no shape do `useQuery`.
 */
function recordsResult(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      limit: 20,
      offset: 0,
      count: 1,
      data: [baseRecord],
      parameters: [
        {
          key: 'entrance_id',
          label: 'Portaria',
          allowed_values: [{ id: 'entrance-1', name: 'Portaria 1' }],
        },
      ],
    },
    isPending: false,
    error: null,
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  searchParams = { limit: 20, offset: 0 }
  currentUser = { permissionCodes: [] }
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/**
 * Aplica o updater de search params que a página entregou ao router na última
 * navegação.
 *
 * É assim que o teste verifica o que o filtro escreveu na URL sem depender do
 * router real.
 *
 * @param previous Search params anteriores à navegação.
 * @returns Search params resultantes.
 */
function lastSearchUpdate(previous: Record<string, unknown> = { limit: 20, offset: 60 }) {
  const args = navigate.mock.calls.at(-1)?.[0] as {
    search: (previous: Record<string, unknown>) => Record<string, unknown>
  }
  return args.search(previous)
}

describe('PortariaPage', () => {
  it('sem permissão de registro mostra o placeholder e não consulta o feed', () => {
    currentUser = { permissionCodes: ['MANAGE_USERS'] }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    expect(screen.getByText('no-access.title')).toBeTruthy()
    expect(screen.queryByText('records.register')).toBeNull()
  })

  it('renderiza os registros do feed com tipo, condutor, portaria e motivo', () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    useAccessRecordsQuery.mockReturnValue(
      recordsResult({
        data: {
          limit: 20,
          offset: 0,
          count: 2,
          data: [
            baseRecord,
            {
              ...baseRecord,
              id: 'record-2',
              kind: 'DENIAL',
              driverName: null,
              reason: 'OVERDUE',
              observation: 'Solicitação venceu em 10/09',
            },
          ],
        },
      }),
    )

    render(<PortariaPage />)

    expect(screen.getByText('records.kind.ENTRY')).toBeTruthy()
    expect(screen.getByText('records.kind.DENIAL')).toBeTruthy()
    expect(screen.getByText('Marina')).toBeTruthy()
    // "Portaria 1" aparece na célula e nas opções do filtro/select do cabeçalho.
    expect(screen.getAllByText('Portaria 1').length).toBeGreaterThan(0)
    expect(screen.getByText('denial.reasons.OVERDUE')).toBeTruthy()
    expect(screen.getByText('records.register')).toBeTruthy()
  })

  it('expande a linha para mostrar a observação do impedimento', () => {
    currentUser = { permissionCodes: ['REGISTER_DENIAL'] }
    useAccessRecordsQuery.mockReturnValue(
      recordsResult({
        data: {
          limit: 20,
          offset: 0,
          count: 1,
          data: [{ ...baseRecord, kind: 'DENIAL', observation: 'Motorista sem vínculo' }],
        },
      }),
    )

    render(<PortariaPage />)

    fireEvent.click(screen.getByRole('button', { name: 'records.expand.expand' }))

    expect(screen.getByText('Motorista sem vínculo')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'records.expand.collapse' })).toBeTruthy()
  })

  it('o botão "Registrar" abre o modal de registro', () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    expect(screen.queryByText('register-dialog-open')).toBeNull()
    fireEvent.click(screen.getByText('records.register'))
    expect(screen.getByText('register-dialog-open')).toBeTruthy()
  })

  it('mostra o estado vazio traduzido', () => {
    currentUser = { permissionCodes: ['REGISTER_EXIT'] }
    useAccessRecordsQuery.mockReturnValue(
      recordsResult({ data: { limit: 20, offset: 0, count: 0, data: [] } }),
    )

    render(<PortariaPage />)

    expect(screen.getByText('records.empty.title')).toBeTruthy()
  })

  it('envia os filtros e a paginação da URL para a query', () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    searchParams = {
      kind: 'DENIAL',
      plate: 'ABC',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-12',
      entranceId: 'all',
      limit: 50,
      offset: 100,
    }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    const params = useAccessRecordsQuery.mock.calls[0][0]
    expect(params.kind).toBe('DENIAL')
    expect(params.plate).toBe('ABC')
    expect(params.entranceId).toBeUndefined()
    expect(params.limit).toBe(50)
    expect(params.offset).toBe(100)
    // O período vai em ISO e o `dateTo` inclui o dia final.
    expect(params.dateFrom).toBe(new Date('2026-09-01T00:00:00.000').toISOString())
    expect(params.dateTo).toBe(new Date('2026-09-12T23:59:59.999').toISOString())
  })

  it('a portaria do dispositivo vira o filtro padrão do feed', () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    localStorage.setItem(DEVICE_ENTRANCE_STORAGE_KEY, 'entrance-1')
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    expect(useAccessRecordsQuery.mock.calls.at(-1)?.[0].entranceId).toBe('entrance-1')
  })

  it('a busca por placa entra na URL depois do debounce', async () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    fireEvent.change(screen.getByLabelText('records.columns.plate'), {
      target: { value: 'abc1d23' },
    })

    await waitFor(
      () => {
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({
            search: expect.any(Function),
          }),
        )
      },
      { timeout: 2000 },
    )
  })

  it('os filtros de tipo e portaria refletem a URL e o metadado do feed', () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    localStorage.setItem(DEVICE_ENTRANCE_STORAGE_KEY, 'entrance-1')
    searchParams = { kind: 'DENIAL', limit: 20, offset: 0 }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    // O tipo vem da URL e o nome da portaria só pode vir de `parameters` (as
    // portarias ativas chegam no envelope — o porteiro não tem MANAGE_ENTRANCES).
    expect(screen.getByLabelText('records.filters.kind.label').textContent).toContain(
      'records.kind.DENIAL',
    )
    expect(screen.getByLabelText('records.filters.entrance.label').textContent).toContain(
      'Portaria 1',
    )
  })

  it('o período escreve as datas na URL (uma por vez)', async () => {
    currentUser = { permissionCodes: ['REGISTER_ENTRY'] }
    useAccessRecordsQuery.mockReturnValue(recordsResult())

    render(<PortariaPage />)

    fireEvent.change(screen.getByLabelText('records.filters.period.from'), {
      target: { value: '2026-09-01' },
    })

    await waitFor(() => {
      expect(navigate).toHaveBeenCalled()
    })
    expect(lastSearchUpdate().dateFrom).toBe('2026-09-01')

    fireEvent.change(screen.getByLabelText('records.filters.period.to'), {
      target: { value: '2026-09-12' },
    })

    await waitFor(() => {
      expect(lastSearchUpdate().dateTo).toBe('2026-09-12')
    })
  })
})
