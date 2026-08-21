// Types
import type { TFunction } from 'i18next'

// Lib
import { buildRulesRows } from '../../../lib/build-rules-rows.lib'
import { downloadWorkbook } from '../../../lib/spreadsheet.lib'

// Libs
import { USERS_RULES_ENTRIES } from './rules'
import { getUsersTemplateExample, USERS_TEMPLATE_HEADERS } from './import-example'

/**
 * Monta o template de importação de usuários (aba `data` + aba de regras) e
 * dispara o download. Usuários não têm abas dinâmicas no v1.
 *
 * @param t Função de tradução da sub-página.
 * @returns Função que baixa o template.
 */
export function buildUsersTemplateDownloader(t: TFunction) {
  return async () => {
    const exampleRow = getUsersTemplateExample(t)

    await downloadWorkbook(
      [
        {
          name: 'data',
          rows: [USERS_TEMPLATE_HEADERS, exampleRow],
        },
        {
          name: t('template.sheets.rules'),
          rows: buildRulesRows(USERS_RULES_ENTRIES, t),
        },
      ],
      t('template.filename'),
    )
  }
}
