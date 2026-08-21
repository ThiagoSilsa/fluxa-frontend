// Router
import { createFileRoute } from '@tanstack/react-router'

// Routes
import { importSearchSchema } from '#/features/import/routes/import.route'

// Pages
import { ImportPage } from '#/features/import/pages/import-page'

// Hoc
import { withRouteAccess } from '#/shared/hoc/route-access'

export const Route = createFileRoute('/_private/management/imports')({
  validateSearch: importSearchSchema,
  component: withRouteAccess({ permissions: ['MANAGE_IMPORTS'] }, ImportRoute),
})

/**
 * Página de importações — repassa os search params para a página (ler a URL é
 * papel da rota, não da página).
 */
function ImportRoute() {
  const search = Route.useSearch()

  return <ImportPage search={search} />
}
