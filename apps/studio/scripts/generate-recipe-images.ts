/**
 * Generate editorial hero images for recipes missing heroImage.
 *
 * Generates via Agent Actions, then migrates the result into the Mise Media Library folder.
 * Run: pnpm --filter studio generate-recipe-images
 */
import {createClient} from '@sanity/client'
import {getCliClient} from 'sanity/cli'
import {migrateImageUrlToMediaLibrary} from '../lib/media-library.ts'

const SCHEMA_ID = '_.schemas.default'

const IMAGE_PROMPTS: Record<string, string> = {
  'classic-chicken-biryani':
    'Professional editorial food photography of classic chicken biryani served in a traditional brass handi pot. Fragrant saffron-streaked basmati rice layered with tender spiced chicken, topped with crispy fried onions, fresh cilantro, and a lemon wedge. Warm natural side lighting, shallow depth of field, rustic cream stone countertop with a muted sage green linen napkin. Cookbook-quality, ultra sharp, appetizing, no text, no watermark, photorealistic.',
  'herbed-lentil-stew':
    'Professional editorial food photography of herbed lentil stew in a deep ceramic bowl. Rich golden-brown dal with visible lentils, fresh parsley and thyme garnish, subtle steam, warm cozy window light. Rustic kitchen scene with cream and sage green tones, wooden spoon beside bowl, shallow depth of field. Cookbook-quality, ultra sharp, appetizing vegetarian comfort food, no text, no watermark, photorealistic.',
  'garlic-butter-pasta':
    'Professional editorial food photography of garlic butter pasta on a wide white ceramic plate. Twisted spaghetti glistening with golden garlic butter, freshly grated Parmesan, cracked black pepper, and a few parsley leaves. Warm natural side lighting, shallow depth of field, rustic cream stone countertop with sage green linen napkin. Cookbook-quality, ultra sharp, appetizing Italian weeknight dinner, no text, no watermark, photorealistic.',
}

function buildPrompt(title: string, summary: string | undefined, slug: string) {
  const preset = IMAGE_PROMPTS[slug]
  if (preset) return preset

  return [
    'Professional editorial food photography for a recipe hero image.',
    `Dish: ${title}.`,
    summary ? `Description: ${summary}.` : '',
    'Warm natural lighting, shallow depth of field, rustic cream and sage green kitchen styling.',
    'Cookbook-quality, ultra sharp, appetizing, no text, no watermark, photorealistic.',
  ]
    .filter(Boolean)
    .join(' ')
}

async function migrateRecipeHeroToMediaLibrary(
  client: ReturnType<typeof createClient>,
  recipeId: string,
  slug: string,
  title: string,
) {
  const {projectId, dataset, token} = client.config()
  if (!projectId || !dataset || !token) {
    throw new Error('Missing Sanity client configuration for Media Library migration.')
  }

  const recipe = await client.fetch<{heroImage?: {asset?: {_ref?: string}}; title?: string}>(
    `*[_id == $id][0]{title, heroImage{asset}}`,
    {id: recipeId},
  )

  const oldAssetId = recipe?.heroImage?.asset?._ref
  if (!oldAssetId) return

  const asset = await client.fetch<{url?: string}>(`*[_id == $id][0]{url}`, {id: oldAssetId})
  if (!asset?.url) return

  const filename = `${slug}-hero.jpg`
  const {heroImage, linkedAssetId} = await migrateImageUrlToMediaLibrary({
    token,
    projectId,
    dataset,
    imageUrl: asset.url,
    filename,
    title: `${recipe.title ?? title} Hero`,
  })

  await client.patch(recipeId).set({heroImage}).commit()
  console.log(`  ✓ migrated to Media Library (${linkedAssetId})`)

  const remainingRefs = await client.fetch<number>(`count(*[references($assetId)])`, {
    assetId: oldAssetId,
  })
  if (remainingRefs === 0) {
    await client.delete(oldAssetId).catch(() => {})
  }
}

async function main() {
  const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
    useCdn: false,
  })
  const {token} = client.config()
  if (!token) {
    throw new Error('Missing auth token. Run with --with-user-token.')
  }

  const pendingMigration = await client.fetch<
    Array<{_id: string; title: string; slug?: {current?: string}}>
  >(
    `*[_type == "recipe" && language == "en-US" && defined(heroImage.asset) && !defined(heroImage.media)]{
      _id,
      title,
      slug
    }`,
  )

  for (const recipe of pendingMigration) {
    const slug = recipe.slug?.current ?? recipe._id
    console.log(`→ Migrating existing hero for ${recipe.title}`)
    await migrateRecipeHeroToMediaLibrary(client, recipe._id, slug, recipe.title)
  }

  const recipes = await client.fetch<
    Array<{_id: string; title: string; summary?: string; slug?: {current?: string}; language?: string}>
  >(
    `*[_type == "recipe" && language == "en-US" && !defined(heroImage.asset)]{
      _id,
      title,
      summary,
      slug,
      language
    }`,
  )

  if (!recipes.length && !pendingMigration.length) {
    console.log('All English recipes already have Media Library hero images.')
    await syncTranslationImages(client)
    return
  }

  if (recipes.length) {
    console.log(`Generating images for ${recipes.length} recipe(s)...`)

    for (const recipe of recipes) {
      const slug = recipe.slug?.current ?? recipe._id
      const instruction = buildPrompt(recipe.title, recipe.summary, slug)

      console.log(`→ ${recipe.title}`)

      await client.agent.action.generate({
        schemaId: SCHEMA_ID,
        documentId: recipe._id,
        instruction,
        target: {path: ['heroImage', 'asset']},
        async: true,
      })
    }

    console.log('Image generation started in the background.')
    console.log('Re-run after ~30s to migrate generated images into Media Library.')
  }

  await syncTranslationImages(client)
}

async function syncTranslationImages(client: ReturnType<typeof createClient>) {
  const pairs = await client.fetch<
    Array<{
      enId: string
      hiId: string
      heroImage?: {_type: 'image'; asset: {_type: 'reference'; _ref: string}}
    }>
  >(
    `*[_type == "translation.metadata" && "recipe" in schemaTypes]{
      "enId": translations[_key == "en-US"][0].value._ref,
      "hiId": translations[_key == "hi-IN"][0].value._ref,
      "heroImage": *[_id == ^.translations[_key == "en-US"][0].value._ref][0].heroImage
    }`,
  )

  for (const pair of pairs) {
    const heroImage = await client.fetch<
      | {
          _type?: 'image'
          asset?: {_type: 'reference'; _ref: string}
          media?: {_type: 'globalDocumentReference'; _ref: string; _weak: true}
        }
      | undefined
    >(`*[_id == $enId][0].heroImage`, {enId: pair.enId})

    if (!heroImage?.asset?._ref || !pair.hiId) continue

    await client.patch(pair.hiId).set({heroImage}).commit()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
