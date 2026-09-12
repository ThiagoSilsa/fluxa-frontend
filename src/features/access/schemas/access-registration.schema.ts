import { z } from 'zod'

// Types
import { ACCESS_REQUEST_USER_TYPES } from '../types/access.types'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

// Types
import type { AccessRequestType } from '../types/access.types'

/**
 * Formulário da exceção registrada na portaria (regra 41).
 *
 * O **cenário não é escolhido**: ele é derivado do que existe (veículo
 * cadastrado? condutor novo ou já cadastrado?) — ver
 * `deriveRegistrationScenario`. O que o formulário coleta são só os dados que
 * faltam, e a obrigatoriedade depende do cenário:
 *
 * - `LINK` — ambos existem: nada a exigir (nem telefone de contato);
 * - `NEW_USER` — condutor novo: nome (+ e-mail se **Colaborador** — ADR 0013) e
 *   telefone de contato;
 * - `NEW_VEHICLE` — veículo novo: modelo e telefone de contato;
 * - `BOTH` — os dois: nome (+ e-mail se Colaborador), modelo e telefone.
 *
 * @param type Cenário derivado do contexto.
 * @returns Schema do formulário daquele cenário.
 */
export function createAccessRegistrationSchema(type: AccessRequestType) {
  return z
    .object({
      /** Tipo do condutor a criar (só usado quando há condutor novo). */
      userType: z.enum(ACCESS_REQUEST_USER_TYPES),
      driverName: optionalText(z.string().max(255)),
      driverEmail: optionalText(z.string().max(255)),
      driverDocument: optionalText(z.string().max(32)),
      driverPhone: optionalText(z.string().max(32)),
      contactPhone: optionalText(z.string().max(32)),
      vehicleModel: optionalText(z.string().max(255)),
      vehicleColor: optionalText(z.string().max(255)),
    })
    .superRefine((values, ctx) => {
      const required = (path: string[], message: string) => {
        ctx.addIssue({ code: 'custom', path, message })
      }

      const createsDriver = type === 'NEW_USER' || type === 'BOTH'
      const createsVehicle = type === 'NEW_VEHICLE' || type === 'BOTH'
      // Só o Colaborador acessa o sistema — e-mail obrigatório (ADR 0013).
      const emailRequired = createsDriver && values.userType === 'EMPLOYEE'

      if (values.driverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.driverEmail)) {
        required(['driverEmail'], 'register.newDriver.errors.email-invalid')
      }

      if (createsDriver && !values.driverName?.trim()) {
        required(['driverName'], 'register.newDriver.errors.name-required')
      }
      if (emailRequired && !values.driverEmail?.trim()) {
        required(['driverEmail'], 'register.newDriver.errors.email-required')
      }
      if (createsVehicle && !values.vehicleModel?.trim()) {
        required(['vehicleModel'], 'register.newDriver.errors.model-required')
      }
      // `LINK` dispensa o contato (ambos já existem — regra 43).
      if (type !== 'LINK' && !values.contactPhone?.trim()) {
        required(['contactPhone'], 'register.newDriver.errors.contact-required')
      }
    })
}

/** Tipo inferido do formulário da exceção. */
export type AccessRegistrationFormValues = z.infer<
  ReturnType<typeof createAccessRegistrationSchema>
>

/** Valores iniciais do formulário da exceção (Visitante — ADR 0013). */
export const DEFAULT_REGISTRATION_VALUES: AccessRegistrationFormValues = {
  userType: 'VISITOR',
  driverName: '',
  driverEmail: '',
  driverDocument: '',
  driverPhone: '',
  contactPhone: '',
  vehicleModel: '',
  vehicleColor: '',
}
