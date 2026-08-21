// Types
import type { TFunction } from 'i18next'

// Lib
import { buildRulesRows } from '../../../lib/build-rules-rows.lib'
import { downloadWorkbook } from '../../../lib/spreadsheet.lib'

// Libs
import { DEPARTMENTS_RULES_ENTRIES } from './rules'
import { DEPARTMENTS_TEMPLATE_HEADERS, getDepartmentsTemplateExample } from './import-example'

/**
 * Monta o template de importação de departamentos (aba `data` + aba de
 * regras) e dispara o download. Departamentos não têm abas dinâmicas (sem
 * referências externas).
 *
 * @param t Função de tradução da sub-página.
 * @returns Função que baixa o template.
 */
export function buildDepartmentsTemplateDownloader(t: TFunction) {
  return async () => {
    const exampleRow = getDepartmentsTemplateExample(t)

    await downloadWorkbook(
      [
        {
          name: 'data',
          rows: [DEPARTMENTS_TEMPLATE_HEADERS, exampleRow],
        },
        {
          name: t('template.sheets.rules'),
          rows: buildRulesRows(DEPARTMENTS_RULES_ENTRIES, t),
        },
      ],
      t('template.filename'),
    )
  }
}
