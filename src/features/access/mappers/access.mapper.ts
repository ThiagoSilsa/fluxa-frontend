// Types
import type {
  OccupancyResponse,
  OccupancyViewModel,
  RegisterEntryPayload,
  RegisterExitPayload,
} from '../types/access.types'

// Utils
import { normalizePlate } from '../utils/plate'

// Schemas
import type { EntryFormValues, ExitFormValues } from '../schemas/portaria.schema'

/**
 * Percentual de ocupação (0–100), `null` quando não há capacidade
 * configurada (evita divisão por zero e "0% de 0 vagas").
 *
 * @param occupied Veículos dentro.
 * @param capacity Vagas cadastradas.
 * @returns Percentual ou `null`.
 */
export function getOccupancyRate(occupied: number, capacity: number): number | null {
  if (capacity <= 0) {
    return null
  }
  return Math.round((occupied / capacity) * 100)
}

/**
 * Converte a resposta de ocupação no viewmodel da tela — adiciona o
 * percentual de cada departamento e o percentual global (para a barra de
 * progresso).
 *
 * @param response Resposta do `GET /access/occupancy`.
 * @returns ViewModel com `rate` por departamento e `totalRate`.
 */
export function toOccupancyViewModel(response: OccupancyResponse): OccupancyViewModel {
  return {
    totalOccupied: response.totalOccupied,
    totalCapacity: response.totalCapacity,
    freeSlots: response.freeSlots,
    totalRate: getOccupancyRate(response.totalOccupied, response.totalCapacity),
    byDepartment: response.byDepartment.map((department) => ({
      departmentId: department.departmentId,
      name: department.name,
      occupied: department.occupied,
      capacity: department.capacity,
      rate: getOccupancyRate(department.occupied, department.capacity),
    })),
  }
}

/**
 * Converte os valores do formulário de entrada no payload do
 * `POST /access/entry` — placa normalizada; campos vazios viram `undefined`.
 *
 * @param values Valores validados do formulário.
 * @returns Payload de registro de entrada.
 */
export function toRegisterEntryPayload(values: EntryFormValues): RegisterEntryPayload {
  const payload: RegisterEntryPayload = {
    plate: normalizePlate(values.plate),
  }

  const accessRequestId = values.accessRequestId?.trim()
  if (accessRequestId) {
    payload.accessRequestId = accessRequestId
  }

  const temporaryDriverName = values.temporaryDriverName?.trim()
  if (temporaryDriverName) {
    payload.temporaryDriverName = temporaryDriverName
  }

  return payload
}

/**
 * Converte os valores do formulário de saída no payload do
 * `POST /access/exit` — placa normalizada; passageiro vazio vira `undefined`.
 *
 * @param values Valores validados do formulário.
 * @returns Payload de registro de saída.
 */
export function toRegisterExitPayload(values: ExitFormValues): RegisterExitPayload {
  const payload: RegisterExitPayload = {
    plate: normalizePlate(values.plate),
  }

  const temporaryDriverName = values.temporaryDriverName?.trim()
  if (temporaryDriverName) {
    payload.temporaryDriverName = temporaryDriverName
  }

  return payload
}
