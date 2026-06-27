import {
  definePlugin,
  type DocumentActionComponent,
  type SchemaTypeDefinition,
} from 'sanity'
import {documentInternationalization, type Language} from '@sanity/document-internationalization'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

import {localeTranslation} from './schemas/localeTranslation'
import {glossaryEntry} from './schemas/glossaryEntry'
import {translationLocale} from './schemas/translationLocale'
import {translationGlossary} from './schemas/translationGlossary'
import {translationStyleGuide} from './schemas/translationStyleGuide'
import {fieldTranslationMetadata} from './schemas/fieldTranslationMetadata'
import {l10nUsEnglishLocaleBundle} from './i18n'
import {SUPPORTED_LANGUAGES_QUERY} from './queries'
import {languageFieldName} from './types'
import {injectLanguageField} from './languageField'
import {LocaleNavbar} from './components/LocaleNavbar'
import {L10nProvider} from './L10nProvider'
import {LocaleBadge} from './components/LocaleBadge'
import {createTranslationInspector} from './translations/createTranslationPanePlugin'
import {createFieldTranslationPublishGate} from './translations/useFieldTranslationPublishGate'

interface L10nOptions {
  localizedSchemaTypes: readonly string[]
  /** Document types with field-level internationalizedArray fields (not document-level i18n). */
  fieldLocalizedSchemaTypes?: readonly string[]
  defaultLanguage?: string
}

export function createL10n({
  localizedSchemaTypes,
  fieldLocalizedSchemaTypes = [],
  defaultLanguage = 'en-US',
}: L10nOptions) {
  const translationInspector = createTranslationInspector({
    internationalizedTypes: [...localizedSchemaTypes],
    defaultLanguage,
    languageField: languageFieldName,
  })

  const fieldLocalizedTypes = new Set(fieldLocalizedSchemaTypes)

  return {
    plugin: definePlugin({
      name: 'l10n',
      i18n: {
        bundles: [l10nUsEnglishLocaleBundle],
      },
      studio: {
        components: {
          navbar: LocaleNavbar,
          layout: L10nProvider,
        },
      },
      schema: {
        types: [
          // Object types
          localeTranslation,
          glossaryEntry,
          // Document types
          translationLocale,
          translationGlossary,
          translationStyleGuide,
          fieldTranslationMetadata,
        ],
        templates: (prev) => [
          ...prev,
          ...localizedSchemaTypes.map((typeName) => ({
            id: `l10n-${typeName}`,
            schemaType: typeName,
            title: typeName.charAt(0).toUpperCase() + typeName.slice(1),
            parameters: [{name: languageFieldName, type: 'string'}],
            value: (params: Record<typeof languageFieldName, string>) => ({
              [languageFieldName]: params[languageFieldName],
            }),
          })),
        ],
      },
      document: {
        inspectors: (prev) => [translationInspector, ...prev],
        actions: (prev: DocumentActionComponent[], context) => {
          if (
            localizedSchemaTypes.includes(context.schemaType) ||
            !fieldLocalizedTypes.has(context.schemaType)
          ) {
            return prev
          }

          return prev.map((action) =>
            action.action === 'publish'
              ? createFieldTranslationPublishGate(action)
              : action,
          )
        },
        badges: (prev, context) =>
          localizedSchemaTypes.includes(context.schemaType)
            ? [...prev.filter((badge) => badge.name !== ''), LocaleBadge]
            : prev,
      },
      plugins: [
        documentInternationalization({
          hideLanguageFilter: (ctx) => localizedSchemaTypes.includes(ctx.schemaType),
          supportedLanguages: (client) =>
            client.fetch<Language[]>(SUPPORTED_LANGUAGES_QUERY, {}, {tag: 'plugin.languages'}),
          schemaTypes: [...localizedSchemaTypes],
        }),
        internationalizedArray({
          languages: (client) =>
            client.fetch<Language[]>(SUPPORTED_LANGUAGES_QUERY, {}, {tag: 'plugin.languages'}),
          defaultLanguages: [defaultLanguage],
          fieldTypes: ['string', 'text'],
        }),
      ],
    })(),
    injectLanguageField: (types: SchemaTypeDefinition[]) => (prev: SchemaTypeDefinition[]) =>
      injectLanguageField(localizedSchemaTypes)([...prev, ...types]),
  }
}
