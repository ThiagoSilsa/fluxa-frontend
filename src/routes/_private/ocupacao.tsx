// Router
import { createFileRoute } from '@tanstack/react-router'

// Pages
import { OcupacaoPage } from '#/features/access/pages/ocupacao-page'

export const Route = createFileRoute('/_private/ocupacao')({
  component: OcupacaoPage,
})
