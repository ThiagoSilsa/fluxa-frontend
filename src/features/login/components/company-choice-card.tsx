// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { ChevronRight } from 'lucide-react'

// UI
import { Button } from '#/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/components/ui/card'

// Feature
import { CompanyAvatar } from './company-avatar'

// Types
import type { LoginCompanyChoice } from '../types/login.types'

interface CompanyChoiceCardProps {
  companies: LoginCompanyChoice[]
  onChoose: (companyId: string) => void
  onBack: () => void
  isSubmitting: boolean
}

/**
 * Escolha de empresa no login (multi-empresa).
 *
 * Aparece só depois de a senha conferir (`requiresCompanyChoice`). A escolha
 * reenvia a credencial junto do `companyId`; "voltar" descarta a credencial
 * pendente.
 */
export function CompanyChoiceCard({
  companies,
  onChoose,
  onBack,
  isSubmitting,
}: CompanyChoiceCardProps) {
  const { t } = useTranslation('login')

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('companyChoice.title')}</CardTitle>
        <CardDescription>{t('companyChoice.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {companies.map((company) => (
            <li key={company.id}>
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full justify-between py-3"
                onClick={() => onChoose(company.id)}
                disabled={isSubmitting}
              >
                <span className="flex items-center gap-3">
                  <CompanyAvatar name={company.name} />
                  <span>{company.name ?? t('companyChoice.unnamed')}</span>
                </span>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t('companyChoice.back')}
        </Button>
      </CardContent>
    </Card>
  )
}
