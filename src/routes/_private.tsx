// Router
import { createFileRoute, Outlet } from '@tanstack/react-router'

// Guards
import { AuthGuard } from '#/app/guards/auth-guard'

// Widgets
import MainLayout from '#/widgets/main-layout/components/main-layout'

export const Route = createFileRoute('/_private')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AuthGuard>
  )
}
