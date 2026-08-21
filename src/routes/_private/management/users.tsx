// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { usersSearchSchema } from '#/features/users/routes/users.route'

// Pages
import { UsersPage } from '#/features/users/pages/user-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/users')({
  validateSearch: usersSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_USERS'] }, UsersPage),
})
