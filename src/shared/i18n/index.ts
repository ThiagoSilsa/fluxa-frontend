import i18n from 'i18next'

// i18n
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './locales/en.json'
import commonPt from './locales/pt.json'
import languageSelectorEn from '#/shared/components/language-selector/i18n/en.json'
import languageSelectorPt from '#/shared/components/language-selector/i18n/pt.json'
import loginEn from '#/features/login/i18n/en.json'
import loginPt from '#/features/login/i18n/pt.json'
import mainLayoutEn from '#/widgets/main-layout/i18n/en.json'
import mainLayoutPt from '#/widgets/main-layout/i18n/pt.json'
import rolesEn from '#/features/roles/i18n/en.json'
import rolesPt from '#/features/roles/i18n/pt.json'
import usersEn from '#/features/users/i18n/en.json'
import usersPt from '#/features/users/i18n/pt.json'
import vehicleTypesEn from '#/features/vehicle-types/i18n/en.json'
import vehicleTypesPt from '#/features/vehicle-types/i18n/pt.json'
import departmentsEn from '#/features/departments/i18n/en.json'
import departmentsPt from '#/features/departments/i18n/pt.json'
import entrancesEn from '#/features/entrances/i18n/en.json'
import entrancesPt from '#/features/entrances/i18n/pt.json'
import vehiclesEn from '#/features/vehicles/i18n/en.json'
import vehiclesPt from '#/features/vehicles/i18n/pt.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: {
        common: commonPt,
        login: loginPt,
        languageSelector: languageSelectorPt,
        mainLayout: mainLayoutPt,
        roles: rolesPt,
        users: usersPt,
        vehicleTypes: vehicleTypesPt,
        departments: departmentsPt,
        entrances: entrancesPt,
        vehicles: vehiclesPt,
      },

      en: {
        common: commonEn,
        login: loginEn,
        languageSelector: languageSelectorEn,
        mainLayout: mainLayoutEn,
        roles: rolesEn,
        users: usersEn,
        vehicleTypes: vehicleTypesEn,
        departments: departmentsEn,
        entrances: entrancesEn,
        vehicles: vehiclesEn,
      },
    },

    fallbackLng: 'en',

    supportedLngs: ['pt', 'en'],

    ns: [
      'common',
      'login',
      'languageSelector',
      'mainLayout',
      'roles',
      'users',
      'vehicleTypes',
      'departments',
      'entrances',
      'vehicles',
    ],

    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },

    /*
      Lê a chave da escolha manual e **não escreve nenhuma**: quem grava é o
      `LanguageProvider`, e só quando alguém mexe no seletor. Com `caches`, todo
      `changeLanguage` gravaria — inclusive o que apenas aplica o idioma da
      empresa —, e a opção "Padrão" perderia como se distinguir de uma escolha.

      Ler aqui, e não só no provedor, é o que evita o piscar: a primeira
      renderização já sai no idioma escolhido, sem passar pelo do navegador.
    */
    detection: {
      order: ['localStorage', 'navigator'],
      caches: [],
    },
  })

// Formatador de interpolação `lowercase`: usado com rótulos personalizados
// (ex.: "Aluno") quando aparecem no meio de uma frase, onde o caixa-baixa é
// mais natural — "Buscar por aluno" em vez de "Buscar por Aluno".
// Ver uso como {{label, lowercase}} nos arquivos de tradução.
i18n.services.formatter?.add('lowercase', (value) =>
  typeof value === 'string' ? value.toLocaleLowerCase() : String(value),
)

export default i18n
