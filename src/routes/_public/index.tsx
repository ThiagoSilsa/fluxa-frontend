import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '#/features/login/pages/login-page'

export const Route = createFileRoute('/_public/')({ component: LoginPage })
