// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { vehicleTypesSearchSchema } from '#/features/vehicle-types/routes/vehicle-types.route'

// Pages
import { VehicleTypePage } from '#/features/vehicle-types/pages/vehicle-type-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/vehicle-types')({
  validateSearch: vehicleTypesSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_VEHICLE_TYPES'] }, VehicleTypePage),
})
