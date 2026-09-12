// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { portariaSearchSchema } from '#/features/access/routes/portaria.route'

// Pages
import { PortariaPage } from '#/features/access/pages/portaria-page'

export const Route = createFileRoute('/_private/portaria')({
  validateSearch: portariaSearchSchema,
  component: PortariaPage,
})
