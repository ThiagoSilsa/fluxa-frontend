import { z } from 'zod'

/** Plataformas de dispositivo (espelho do enum `device_platform` do backend). */
export const DEVICE_PLATFORMS = ['ANDROID', 'IOS'] as const

/**
 * Schema do formulário de dispositivo (criação/edição).
 *
 * `platform` é obrigatória na criação e **imutável** na edição (desabilitada
 * no dialog — ADR 0008 §7). `entranceId` vazio = sem portaria vinculada.
 */
export const deviceFormSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(1, { message: 'form.errors.name-required' })
    .max(100, { message: 'form.errors.name-max' }),
  platform: z.enum(DEVICE_PLATFORMS, { message: 'form.errors.platform-required' }),
  entranceId: z.string().optional(),
  isActive: z.boolean(),
})

/** Tipo inferido do schema de formulário de dispositivo. */
export type DeviceFormValues = z.infer<typeof deviceFormSchema>
