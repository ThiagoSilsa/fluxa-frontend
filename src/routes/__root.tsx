import { createRootRouteWithContext } from '@tanstack/react-router'

import appCss from '#/styles/globals.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { RootDocument } from '#/app/layouts/root-document'

import '../shared/i18n'

interface MyRouterContext {
  queryClient: QueryClient
}
/**
 * The root route of your application. This is where you can define the HTML document structure,
 * including the head and body. You can also include any global components or providers here.
 */
export const Route = createRootRouteWithContext<MyRouterContext>()({
  // TODO: Adicionar página de erro 404 personalizada.
  // notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Techlithy CRM',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})
