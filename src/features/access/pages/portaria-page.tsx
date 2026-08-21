// React
import { useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Mappers
import { toRegisterEntryPayload, toRegisterExitPayload } from '../mappers/access.mapper'

// Components
import { EntryResult } from '../components/entry-result'
import { ExitResult } from '../components/exit-result'
import { PortariaEntryForm } from '../components/portaria-entry-form'
import { PortariaExitForm } from '../components/portaria-exit-form'

// Hooks
import { useAccessMutations } from '../hooks/use-access-mutations'

// Types
import type {
  AccessEntryResponse,
  AccessExitResponse,
  RegisterEntryPayload,
} from '../types/access.types'
import type { EntryFormValues, ExitFormValues } from '../schemas/portaria.schema'

// Shared
import { isApiError } from '#/shared/lib/api-error'
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  PageLayout,
  PagePlaceholder,
  Header,
} from '#/shared/components'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

type PortariaTab = 'entry' | 'exit'

/**
 * Página da portaria (ADR 0010 M5 — Fase 1).
 *
 * Registrar entrada (por placa ou QR) e saída (com conferência do condutor).
 * Entrada exige `REGISTER_ENTRY`; saída exige `REGISTER_EXIT`. Vaga cheia
 * (409) abre confirmação `overCapacity` ao porteiro; impedimentos são
 * exibidos com o motivo registrado automaticamente.
 */
export function PortariaPage() {
  const { t } = useTranslation('access')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canEntry = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.REGISTER_ENTRY] }),
    [user],
  )
  const canExit = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.REGISTER_EXIT] }),
    [user],
  )

  const [tab, setTab] = useState<PortariaTab>('entry')
  const [entryResult, setEntryResult] = useState<AccessEntryResponse | null>(null)
  const [exitResult, setExitResult] = useState<AccessExitResponse | null>(null)
  const [overCapacityTarget, setOverCapacityTarget] = useState<RegisterEntryPayload | null>(null)

  const { registerEntry, registerExit } = useAccessMutations()

  if (!canEntry && !canExit) {
    return (
      <PageLayout>
        <PagePlaceholder title={tc('no-access.title')} />
      </PageLayout>
    )
  }

  const handleEntrySubmit = (values: EntryFormValues) => {
    const payload = toRegisterEntryPayload(values)
    setEntryResult(null)
    registerEntry.mutate(payload, {
      onSuccess: (data) => setEntryResult(data),
      onError: (error) => {
        // 409 — vaga cheia: oferece a confirmação overCapacity.
        if (isApiError(error) && error.statusCode === 409) {
          setOverCapacityTarget(payload)
        }
      },
    })
  }

  const handleConfirmOverCapacity = () => {
    if (!overCapacityTarget) {
      return
    }
    const target = overCapacityTarget
    setOverCapacityTarget(null)
    setEntryResult(null)
    registerEntry.mutate(
      { ...target, overCapacity: true },
      { onSuccess: (data) => setEntryResult(data) },
    )
  }

  const handleExitSubmit = (values: ExitFormValues) => {
    setExitResult(null)
    registerExit.mutate(toRegisterExitPayload(values), {
      onSuccess: (data) => setExitResult(data),
    })
  }

  const activeTab: PortariaTab = !canEntry && canExit ? 'exit' : tab

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      {/* Seletor Entrada/Saída */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeTab === 'entry' ? 'default' : 'outline'}
          onClick={() => setTab('entry')}
          disabled={!canEntry}
        >
          {t('tabs.entry')}
        </Button>
        <Button
          type="button"
          variant={activeTab === 'exit' ? 'default' : 'outline'}
          onClick={() => setTab('exit')}
          disabled={!canExit}
        >
          {t('tabs.exit')}
        </Button>
      </div>

      {activeTab === 'entry' && canEntry ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.entry.title')}</CardTitle>
              <CardDescription>{t('form.entry.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PortariaEntryForm isPending={registerEntry.isPending} onSubmit={handleEntrySubmit} />
            </CardContent>
          </Card>

          {entryResult ? (
            <div className="space-y-4">
              <EntryResult result={entryResult} />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'exit' && canExit ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.exit.title')}</CardTitle>
              <CardDescription>{t('form.exit.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PortariaExitForm isPending={registerExit.isPending} onSubmit={handleExitSubmit} />
            </CardContent>
          </Card>

          {exitResult ? (
            <div className="space-y-4">
              <ExitResult result={exitResult} />
            </div>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={overCapacityTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOverCapacityTarget(null)
          }
        }}
        title={t('notifications.over-capacity-title')}
        description={t('notifications.over-capacity-description')}
        confirmLabel={t('notifications.over-capacity-confirm')}
        cancelLabel={t('notifications.over-capacity-cancel')}
        onConfirm={handleConfirmOverCapacity}
        isPending={registerEntry.isPending}
        variant="default"
      />
    </PageLayout>
  )
}
