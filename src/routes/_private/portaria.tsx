// Router
import { createFileRoute } from '@tanstack/react-router'

// Pages
import { PortariaPage } from '#/features/access/pages/portaria-page'

export const Route = createFileRoute('/_private/portaria')({
  component: PortariaPage,
})
