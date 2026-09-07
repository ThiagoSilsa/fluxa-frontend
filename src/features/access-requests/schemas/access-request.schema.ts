import { z } from 'zod'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

/**
 * UUID aceitando qualquer nibble de versão (0–8) — espelho do backend
 * (`UUID_ANY_VERSION_PATTERN`). Os IDs seedados usam nibble `0`.
 */
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Formulário de criação de solicitação de acesso (4 cenários — regra 41).
 *
 * Campos comuns: tipo, placa e contato. Os campos obrigatórios dependem do
 * cenário (validação no `superRefine`):
 * - `NEW_USER` — veículo existente + dados do motorista + contato;
 * - `NEW_VEHICLE` — usuário existente + dados do veículo + contato;
 * - `LINK` — veículo + usuário existentes;
 * - `BOTH` — dados do motorista + dados do veículo + contato.
 */
export const accessRequestFormSchema = z
  .object({
    type: z.enum(['NEW_USER', 'NEW_VEHICLE', 'LINK', 'BOTH']),
    plate: z
      .string({ message: 'form.errors.plate-required' })
      .min(1, { message: 'form.errors.plate-required' })
      .max(10, { message: 'form.errors.plate-max' }),
    vehicleId: z
      .string()
      .refine((value) => value === '' || uuidPattern.test(value), {
        message: 'form.errors.vehicle-invalid',
      })
      .optional(),
    userId: z
      .string()
      .refine((value) => value === '' || uuidPattern.test(value), {
        message: 'form.errors.user-invalid',
      })
      .optional(),
    contactChannel: z.enum(['WHATSAPP', 'PHONE', 'EMAIL']).optional(),
    contactPhone: z.string().max(32).optional(),
    driverName: optionalText(z.string().max(255)),
    driverEmail: optionalText(z.string().max(255)),
    driverDocument: optionalText(z.string().max(32)),
    driverPhone: optionalText(z.string().max(32)),
    vehicleModel: optionalText(z.string().max(255)),
    vehicleColor: optionalText(z.string().max(255)),
  })
  .superRefine((values, ctx) => {
    const required = (path: string[], message: string) => {
      ctx.addIssue({ code: 'custom', path, message })
    }

    if (!isValidBrazilianPlate(values.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'form.errors.plate-invalid',
      })
    }

    switch (values.type) {
      case 'NEW_USER':
        if (!values.vehicleId) {
          required(['vehicleId'], 'form.errors.vehicle-required')
        }
        if (!values.driverName?.trim()) {
          required(['driverName'], 'form.errors.driver-name-required')
        }
        if (!values.driverEmail?.trim()) {
          required(['driverEmail'], 'form.errors.driver-email-required')
        }
        if (!values.contactPhone?.trim()) {
          required(['contactPhone'], 'form.errors.contact-required')
        }
        break
      case 'NEW_VEHICLE':
        if (!values.userId) {
          required(['userId'], 'form.errors.user-required')
        }
        if (!values.vehicleModel?.trim()) {
          required(['vehicleModel'], 'form.errors.vehicle-model-required')
        }
        if (!values.contactPhone?.trim()) {
          required(['contactPhone'], 'form.errors.contact-required')
        }
        break
      case 'LINK':
        if (!values.vehicleId) {
          required(['vehicleId'], 'form.errors.vehicle-required')
        }
        if (!values.userId) {
          required(['userId'], 'form.errors.user-required')
        }
        break
      case 'BOTH':
        if (!values.driverName?.trim()) {
          required(['driverName'], 'form.errors.driver-name-required')
        }
        if (!values.driverEmail?.trim()) {
          required(['driverEmail'], 'form.errors.driver-email-required')
        }
        if (!values.vehicleModel?.trim()) {
          required(['vehicleModel'], 'form.errors.vehicle-model-required')
        }
        if (!values.contactPhone?.trim()) {
          required(['contactPhone'], 'form.errors.contact-required')
        }
        break
    }
  })

/** Tipo inferido do formulário de criação. */
export type AccessRequestFormValues = z.infer<typeof accessRequestFormSchema>
