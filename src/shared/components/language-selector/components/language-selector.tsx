// i18n
import { useTranslation } from 'react-i18next'

// Providers
import { useLanguagePreference } from '#/app/providers/language-provider'

// Components
import { FlagIcon } from '#/shared/components/flag-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components/ui/select'

// Lib
import { APP_LANGUAGES } from '#/shared/lib/language.lib'

// Types
import type { AppLanguage } from '#/shared/lib/language.lib'

/** Valor da opção que devolve a decisão ao idioma do navegador. */
const FOLLOW_DEFAULT = 'default'

type LanguageSelectorProps = {
  /** Rótulo completo em vez das duas letras. Usado onde há espaço. */
  verbose?: boolean
  className?: string
}

/**
 * Seleção do idioma da interface.
 *
 * A primeira opção é "Padrão", que **apaga** a escolha manual e devolve a
 * decisão ao idioma detectado do navegador. Sem ela, quem trocasse uma vez
 * ficaria preso à própria escolha para sempre, sem caminho de volta.
 *
 * @param verbose Mostra "Português" em vez de "PT".
 * @param className Classes do gatilho.
 */
export function LanguageSelector({ verbose = false, className }: LanguageSelectorProps) {
  const { t } = useTranslation('languageSelector')
  const { language, override, setLanguage } = useLanguagePreference()

  const label = (value: AppLanguage) => (verbose ? t(`languages.${value}`) : t(`short.${value}`))

  return (
    <Select
      value={override ?? FOLLOW_DEFAULT}
      onValueChange={(next) => setLanguage(next === FOLLOW_DEFAULT ? null : (next as AppLanguage))}
    >
      <SelectTrigger
        className={className ?? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
        size="sm"
        aria-label={t('label')}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent position="popper">
        <SelectItem value={FOLLOW_DEFAULT}>
          <span className="flex items-center gap-2">
            <FlagIcon language={language} className="h-3 w-4.5 shrink-0 rounded-xs" />
            {t('follow-company')}
          </span>
        </SelectItem>

        {APP_LANGUAGES.map((value) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <FlagIcon language={value} className="h-3 w-4.5 shrink-0 rounded-xs" />
              {label(value)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
