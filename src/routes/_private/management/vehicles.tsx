// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { vehiclesSearchSchema } from '#/features/vehicles/routes/vehicles.route'

// Pages
import { VehiclesPage } from '#/features/vehicles/pages/vehicle-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/vehicles')({
  validateSearch: vehiclesSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_VEHICLES'] }, VehiclesPage),
})
