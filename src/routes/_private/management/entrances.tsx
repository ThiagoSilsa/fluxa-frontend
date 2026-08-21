// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { entrancesSearchSchema } from '#/features/entrances/routes/entrances.route'

// Pages
import { EntrancePage } from '#/features/entrances/pages/entrance-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/entrances')({
  validateSearch: entrancesSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_ENTRANCES'] }, EntrancePage),
})
