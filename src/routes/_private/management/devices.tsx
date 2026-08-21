// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { devicesSearchSchema } from '#/features/devices/routes/devices.route'

// Pages
import { DevicesPage } from '#/features/devices/pages/device-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/devices')({
  validateSearch: devicesSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_DEVICES'] }, DevicesPage),
})
