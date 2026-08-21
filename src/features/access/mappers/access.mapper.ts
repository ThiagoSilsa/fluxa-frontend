// Types
import type { RegisterEntryPayload, RegisterExitPayload } from '../types/access.types'

// Utils
import { normalizePlate } from '../utils/plate'

// Schemas
import type { EntryFormValues, ExitFormValues } from '../schemas/portaria.schema'

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
