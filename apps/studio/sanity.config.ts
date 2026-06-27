import {createClient} from '@sanity/client'
import {defineConfig} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {assist} from '@sanity/assist'
import {visionTool} from '@sanity/vision'
import {EarthGlobeIcon, HomeIcon} from '@sanity/icons'
import {agentContextPlugin} from '@sanity/agent-context/studio'
import {createL10n, useTranslateFieldAction, withLocaleFilter} from '@starter/l10n'
import {schemaTypes} from './schemaTypes'
import {MiseIcon} from './components/MiseIcon'
import {resolve} from './lib/resolve'

const localPreviewUrl = 'http://localhost:4321'
const productionPreviewUrl = 'https://mise-web.shehjkhan.workers.dev'
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL ?? localPreviewUrl
const previewInitialUrl = `${previewUrl.replace(/\/$/, '')}/en-us/`
// Allow iframe preview from both local and deployed Astro apps regardless of which Studio build you use.
const studioPreviewOrigins = [...new Set([previewUrl, localPreviewUrl, productionPreviewUrl])]

const l10nTypes = ['l10n.locale', 'l10n.glossary', 'l10n.styleGuide', 'translation.metadata']

const localizedDocumentTypes = ['recipe', 'homePage', 'mealPlanEntry', 'pantrySnapshot'] as const

const fieldLocalizedDocumentTypes = ['ingredient', 'recipeCategory', 'pantryCategory'] as const

const projectId = import.meta.env?.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = import.meta.env?.SANITY_STUDIO_DATASET ?? process.env.SANITY_STUDIO_DATASET!

const l10n = createL10n({
  localizedSchemaTypes: [...localizedDocumentTypes],
  fieldLocalizedSchemaTypes: [...fieldLocalizedDocumentTypes],
  defaultLanguage: 'en-US',
})

const titleAsc = [{field: 'title', direction: 'asc'} as const]
const dateDesc = [{field: 'date', direction: 'desc'} as const]
const nameAsc = [{field: 'name', direction: 'asc'} as const]

const structure = ((S) =>
  S.list()
    .title('Mise')
    .items([
      S.documentTypeListItem('homePage')
        .title('Dashboard')
        .icon(HomeIcon)
        .child(() => withLocaleFilter(S.documentTypeList('homePage').defaultOrdering(titleAsc))),
      S.documentTypeListItem('recipe').child(() =>
        withLocaleFilter(S.documentTypeList('recipe').defaultOrdering(titleAsc)),
      ),
      S.documentTypeListItem('mealPlanEntry').child(() =>
        withLocaleFilter(S.documentTypeList('mealPlanEntry').defaultOrdering(dateDesc)),
      ),
      S.documentTypeListItem('pantrySnapshot').child(() =>
        withLocaleFilter(S.documentTypeList('pantrySnapshot').defaultOrdering(titleAsc)),
      ),
      S.divider(),
      S.documentTypeListItem('ingredient').child(
        S.documentTypeList('ingredient').defaultOrdering(nameAsc),
      ),
      S.documentTypeListItem('recipeCategory').child(
        S.documentTypeList('recipeCategory').defaultOrdering([
          {field: 'kind', direction: 'asc'},
          {field: 'sortOrder', direction: 'asc'},
        ]),
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

  mediaLibrary: {
    enabled: true,
  },

  form: {
    image: {
      assetSources: (sources) => sources.filter((source) => source.name !== 'sanity-default'),
    },
  },

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
  },

  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        initial: previewInitialUrl,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      allowOrigins: studioPreviewOrigins,
    }),
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
