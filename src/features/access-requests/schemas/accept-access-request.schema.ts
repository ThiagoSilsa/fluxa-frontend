import { z } from 'zod'

/** Senha mínima do Colaborador (espelho do backend — ADR 0013). */
export const ACCEPT_PASSWORD_MIN_LENGTH = 6

/** Senha máxima do Colaborador (espelho do backend — ADR 0013). */
export const ACCEPT_PASSWORD_MAX_LENGTH = 128

/**
 * Valores do aceite coletados no dialog de detalhe da solicitação.
 */
export interface AcceptAccessRequestFormValues {
  /** Tipo do veículo a criar (exigido em `NEW_VEHICLE`/`BOTH`). */
  vehicleTypeId: string
  /** Cargo do Colaborador (exigido quando `userType = EMPLOYEE`). */
  roleId: string
  /** Senha do Colaborador (exigida quando `userType = EMPLOYEE`). */
  password: string
}

/** Valores iniciais do aceite. */
export const ACCEPT_ACCESS_REQUEST_DEFAULT_VALUES: AcceptAccessRequestFormValues = {
  vehicleTypeId: '',
  roleId: '',
  password: '',
}

/**
 * Monta o schema do aceite conforme o que o cenário/tipo da solicitação exige:
 * tipo do veículo ao criar veículo (regra 22) e cargo + senha ao criar um
 * Colaborador (ADR 0013).
 *
 * @param needsVehicleType Se o cenário cria veículo (`NEW_VEHICLE`/`BOTH`).
 * @param needsEmployeeCredentials Se o motorista a criar é Colaborador.
 * @returns Schema do formulário de aceite.
 */
export function buildAcceptAccessRequestSchema({
  needsVehicleType,
  needsEmployeeCredentials,
}: {
  needsVehicleType: boolean
  needsEmployeeCredentials: boolean
}) {
  return z
    .object({
      vehicleTypeId: z.string(),
      roleId: z.string(),
      password: z.string(),
    })
    .superRefine((values, ctx) => {
      if (needsVehicleType && !values.vehicleTypeId) {
        ctx.addIssue({
          code: 'custom',
          path: ['vehicleTypeId'],
          message: 'form.errors.vehicle-type-required',
        })
      }

      if (!needsEmployeeCredentials) {
        return
      }

      if (!values.roleId) {
        ctx.addIssue({
          code: 'custom',
          path: ['roleId'],
          message: 'form.errors.role-required',
        })
      }

      if (!values.password.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'form.errors.password-required',
        })
      } else if (values.password.length < ACCEPT_PASSWORD_MIN_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'form.errors.password-min',
        })
      } else if (values.password.length > ACCEPT_PASSWORD_MAX_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'form.errors.password-max',
        })
      }
    })
}
