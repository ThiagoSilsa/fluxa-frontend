// Router
import { createFileRoute } from '@tanstack/react-router'

// Pages
import { AccessRequestsPage } from '#/features/access-requests/pages/access-requests-page'

export const Route = createFileRoute('/_private/requests')({
  component: AccessRequestsPage,
})
