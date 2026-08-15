import { z } from 'zod'

/**
 * Torna um campo de texto opcional, aceitando string vazia como "ausente".
 *
 * Campos como descrição não são obrigatórios, mas um formulário envia `''`
 * quando o usuário não digita nada. Em vez de tratar `''` como erro, o schema
 * aceita a string vazia — o mapper converte para `null` no payload.
 *
 * @param schema Schema do texto quando preenchido (ex.: `z.string().max(500)`).
 * @returns Schema opcional que aceita `''` como valor válido.
 */
export function optionalText(schema: z.ZodString) {
  return z.union([schema, z.literal('')]).optional()
}
