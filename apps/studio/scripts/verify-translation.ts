/**
 * Verify Agent API translation workflow for a sample recipe.
 *
 * Usage:
 *   pnpm --filter studio exec sanity exec scripts/verify-translation.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {buildTranslateParams, filterGlossaryByContent} from '@starter/l10n/promptAssembly'

const client = getCliClient({apiVersion: 'vX'})
const {projectId, dataset} = client.config()

const sourceLocale = 'en-US'
const targetLocale = 'hi-IN'

const [sourceRecipe] = await client.fetch<{_id: string; title: string}[]>(
  `*[_type == "recipe" && language == $locale && slug.current == "herbed-lentil-stew"][0..0]{_id, title}`,
  {locale: sourceLocale},
  {tag: 'verify-translation.source'},
)

if (!sourceRecipe) {
  throw new Error('Source recipe not found. Run bootstrap / import sample data first.')
}

const glossaries = await client.fetch(
  `*[_type == "l10n.glossary"]{title, entries}`,
  {},
  {tag: 'verify-translation.glossary'},
)
const styleGuide = await client.fetch(
  `*[_type == "l10n.styleGuide" && locale->code == $locale][0]`,
  {locale: targetLocale},
  {tag: 'verify-translation.style-guide'},
)
const locales = await client.fetch<{code: string; title: string; nativeName?: string}[]>(
  `*[_type == "l10n.locale"]{code, title, nativeName}`,
  {},
  {tag: 'verify-translation.locales'},
)

const sourceDoc = await client.fetch(
  `*[_id == $id][0]`,
  {id: sourceRecipe._id},
  {tag: 'verify-translation.source-doc'},
)

const relevantGlossaries = filterGlossaryByContent(glossaries, sourceDoc)
const fromLanguage = locales.find((l) => l.code === sourceLocale)
const toLanguage = locales.find((l) => l.code === targetLocale)

if (!fromLanguage || !toLanguage) {
  throw new Error('Locales not seeded. Run seed-locales migration first.')
}

const params = buildTranslateParams({
  schemaId: '_.schemas.default',
  documentId: sourceRecipe._id,
  glossaries: relevantGlossaries,
  sourceLocale: fromLanguage,
  targetLocale: toLanguage,
  styleGuide,
})

console.log(`Translating "${sourceRecipe.title}" (${sourceLocale} → ${targetLocale})`)

const response = await client.agent.action.translate({
  ...params,
  targetDocument: {operation: 'create'},
})

console.log('Translation draft created:', response.documentId)
console.log(`Project: ${projectId} · Dataset: ${dataset}`)
