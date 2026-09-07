// Router
import { createFileRoute } from '@tanstack/react-router'

// Pages
import { BlocksPage } from '#/features/blocks/pages/blocks-page'

export const Route = createFileRoute('/_private/blocks')({
  component: BlocksPage,
})
