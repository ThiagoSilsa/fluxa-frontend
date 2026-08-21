// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { departmentsSearchSchema } from '#/features/departments/routes/departments.route'

// Pages
import { DepartmentPage } from '#/features/departments/pages/department-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/departments')({
  validateSearch: departmentsSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_DEPARTMENTS'] }, DepartmentPage),
})
