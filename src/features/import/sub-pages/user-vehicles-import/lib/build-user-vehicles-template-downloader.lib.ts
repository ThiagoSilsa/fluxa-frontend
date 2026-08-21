// Types
import type { TFunction } from 'i18next'

// Lib
import { buildRulesRows } from '../../../lib/build-rules-rows.lib'
import { downloadWorkbook } from '../../../lib/spreadsheet.lib'

// Libs
import { USER_VEHICLES_RULES_ENTRIES } from './rules'
import { getUserVehiclesTemplateExample, USER_VEHICLES_TEMPLATE_HEADERS } from './import-example'

/**
 * Monta o template de importação de vínculo usuário-veículo (aba `data` +
 * aba de regras) e dispara o download. Sem abas dinâmicas no v1.
 *
 * @param t Função de tradução da sub-página.
 * @returns Função que baixa o template.
 */
export function buildUserVehiclesTemplateDownloader(t: TFunction) {
  return async () => {
    const exampleRow = getUserVehiclesTemplateExample(t)

    await downloadWorkbook(
      [
        {
          name: 'data',
          rows: [USER_VEHICLES_TEMPLATE_HEADERS, exampleRow],
        },
        {
          name: t('template.sheets.rules'),
          rows: buildRulesRows(USER_VEHICLES_RULES_ENTRIES, t),
        },
      ],
      t('template.filename'),
    )
  }
}
