// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { rolesSearchSchema } from '#/features/roles/routes/roles.route'

// Pages
import { RolesPage } from '#/features/roles/pages/role-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/roles')({
  validateSearch: rolesSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_ROLES'] }, RolesPage),
})
