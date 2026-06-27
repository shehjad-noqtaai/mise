import {createClient} from '@sanity/client'
import type {ComponentType} from 'react'
import {defineConfig} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {assist} from '@sanity/assist'
import {visionTool} from '@sanity/vision'
import {EarthGlobeIcon, HomeIcon} from '@sanity/icons'
import {agentContextPlugin} from '@sanity/agent-context/studio'
import {
  createL10n,
  createFieldTranslationPublishGate,
  useTranslateFieldAction,
  withLocaleFilter,
} from '@starter/l10n'
import {schemaTypes} from './schemaTypes'
import {MiseIcon} from './components/MiseIcon'

const l10nTypes = [
  'l10n.locale',
  'l10n.glossary',
  'l10n.styleGuide',
  'translation.metadata',
  'fieldTranslation.metadata',
]

const localizedDocumentTypes = ['recipe', 'homePage', 'mealPlanEntry', 'pantrySnapshot'] as const

const projectId = import.meta.env?.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = import.meta.env?.SANITY_STUDIO_DATASET ?? process.env.SANITY_STUDIO_DATASET!

const l10n = createL10n({
  localizedSchemaTypes: [...localizedDocumentTypes],
  defaultLanguage: 'en-US',
})

const titleAsc = [{field: 'title', direction: 'asc'} as const]
const dateDesc = [{field: 'date', direction: 'desc'} as const]
const nameAsc = [{field: 'name', direction: 'asc'} as const]

function createLocalizedSingleton(
  S: Parameters<StructureResolver>[0],
  typeName: string,
  title: string,
  icon?: ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          ['en-US', 'hi-IN'].map((locale) =>
            S.listItem()
              .title(`${title} (${locale})`)
              .icon(icon)
              .child(
                S.document()
                  .schemaType(typeName)
                  .documentId(`${typeName}-${locale}`)
                  .title(`${title} (${locale})`),
              ),
          ),
        ),
    )
}

const structure = ((S) =>
  S.list()
    .title('Mise')
    .items([
      createLocalizedSingleton(S, 'homePage', 'Dashboard', HomeIcon),
      S.documentTypeListItem('recipe').child(() =>
        withLocaleFilter(S.documentTypeList('recipe').defaultOrdering(titleAsc)),
      ),
      S.documentTypeListItem('mealPlanEntry').child(() =>
        withLocaleFilter(S.documentTypeList('mealPlanEntry').defaultOrdering(dateDesc)),
      ),
      createLocalizedSingleton(S, 'pantrySnapshot', 'Pantry Snapshot'),
      S.divider(),
      S.documentTypeListItem('ingredient').child(
        S.documentTypeList('ingredient').defaultOrdering(nameAsc),
      ),
      S.documentTypeListItem('recipeCategory').child(
        S.documentTypeList('recipeCategory').defaultOrdering(titleAsc),
      ),
      S.documentTypeListItem('pantryCategory').child(
        S.documentTypeList('pantryCategory').defaultOrdering(titleAsc),
      ),
      S.divider(),
      S.listItem()
        .title('Localization')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('Localization')
            .items(
              l10nTypes.map((type) =>
                S.documentTypeListItem(type).child(
                  type === 'translation.metadata'
                    ? S.documentTypeList(type)
                    : S.documentTypeList(type).defaultOrdering(titleAsc),
                ),
              ),
            ),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          ![
            'recipe',
            'homePage',
            'mealPlanEntry',
            'pantrySnapshot',
            'ingredient',
            'recipeCategory',
            'pantryCategory',
            ...l10nTypes,
          ].includes(item.getId() ?? ''),
      ),
    ])) satisfies StructureResolver

export default defineConfig({
  name: 'default',
  title: 'Mise Kitchen OS',
  icon: MiseIcon,

  projectId,
  dataset,

  unstable_clientFactory: (options) =>
    createClient({
      ...options,
      requestTagPrefix: `${options.requestTagPrefix}.mise`,
    }),

  document: {
    newDocumentOptions: (prev) =>
      prev.filter(
        (option) =>
          option.templateId !== 'translation.metadata' &&
          option.templateId !== 'fieldTranslation.metadata',
      ),
    actions: (prev, context) => {
      if (localizedDocumentTypes.includes(context.schemaType as (typeof localizedDocumentTypes)[number])) {
        return prev
      }
      return prev.map((action) =>
        action.displayName === 'SchedulePublishAction'
          ? createFieldTranslationPublishGate(action)
          : action,
      )
    },
  },

  plugins: [
    structureTool({structure}),
    visionTool(),
    agentContextPlugin(),
    l10n.plugin,
    assist({
      fieldActions: {
        title: 'Translate',
        useFieldActions: useTranslateFieldAction,
      },
    }),
  ],

  schema: {
    types: l10n.injectLanguageField(schemaTypes),
  },
})
