import { z } from 'zod'

/**
 * Schema do payload do JWT emitido pelo backend (`fluxa-backend`).
 *
 * O `JwtAuthGuard` exige `sub`, `companyId` e `email`; `iat` e `exp` são
 * preenchidos pelo `@nestjs/jwt`. Contrato em `fluxa-backend/src/shared/security/jwt.payload.ts`.
 */
export const authTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  companyId: z.string().min(1),
  email: z.string().min(1),
  iat: z.number(),
  exp: z.number(),
})

export type AuthTokenPayloadSchema = z.infer<typeof authTokenPayloadSchema>
