// Types
import type { TFunction } from 'i18next'

// Lib
import { buildRulesRows } from '../../../lib/build-rules-rows.lib'
import { downloadWorkbook } from '../../../lib/spreadsheet.lib'

// Libs
import { VEHICLES_RULES_ENTRIES } from './rules'
import { getVehiclesTemplateExample, VEHICLES_TEMPLATE_HEADERS } from './import-example'

/**
 * Monta o template de importação de veículos (aba `data` + aba de regras) e
 * dispara o download. Veículos não têm abas dinâmicas no v1.
 *
 * @param t Função de tradução da sub-página.
 * @returns Função que baixa o template.
 */
export function buildVehiclesTemplateDownloader(t: TFunction) {
  return async () => {
    const exampleRow = getVehiclesTemplateExample(t)

    await downloadWorkbook(
      [
        {
          name: 'data',
          rows: [VEHICLES_TEMPLATE_HEADERS, exampleRow],
        },
        {
          name: t('template.sheets.rules'),
          rows: buildRulesRows(VEHICLES_RULES_ENTRIES, t),
        },
      ],
      t('template.filename'),
    )
  }
}
