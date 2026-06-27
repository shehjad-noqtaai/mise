/**
 * Move recipe hero images from dataset-only assets into the Mise Media Library folder,
 * relink recipes, and delete orphaned dataset assets.
 *
 * Run: pnpm --filter studio migrate-recipe-images
 */
import {getCliClient} from 'sanity/cli'
import {deleteMediaLibraryAsset, migrateImageUrlToMediaLibrary} from '../lib/media-library.ts'

const LEGACY_ASSETS = [
  {
    oldAssetId: 'image-e74a3f4ce987ea394c9d6dc95403c95e3b5c4c8a-1408x768-jpg',
    filename: 'classic-chicken-biryani-hero.jpg',
    title: 'Classic Chicken Biryani Hero',
    imageUrl:
      'https://cdn.sanity.io/images/1rkupi9j/production/e74a3f4ce987ea394c9d6dc95403c95e3b5c4c8a-1408x768.jpg',
  },
  {
    oldAssetId: 'image-6b33d6836726d97b566a13817838d0210b55e51c-1408x768-jpg',
    filename: 'herbed-lentil-stew-hero.jpg',
    title: 'Herbed Lentil Stew Hero',
    imageUrl:
      'https://cdn.sanity.io/images/1rkupi9j/production/6b33d6836726d97b566a13817838d0210b55e51c-1408x768.jpg',
  },
  {
    oldAssetId: 'image-1866bb2f965e90853aa8b7a12eb1b4d1f873ca04-1408x768-jpg',
    filename: 'garlic-butter-pasta-hero.jpg',
    title: 'Garlic Butter Pasta Hero',
    imageUrl:
      'https://cdn.sanity.io/images/1rkupi9j/production/1866bb2f965e90853aa8b7a12eb1b4d1f873ca04-1408x768.jpg',
  },
] as const

const TEST_ASSET_ID = '3FhIXOEInSWC0uNFUGDYCgck0d9'

async function main() {
  const cli = getCliClient()
  const {projectId, dataset, token} = cli.config()

  if (!projectId || !dataset || !token) {
    throw new Error('Missing projectId, dataset, or auth token. Run with --with-user-token.')
  }

  const client = cli.withConfig({useCdn: false, token, apiVersion: '2025-02-19'})

  await deleteMediaLibraryAsset(token, TEST_ASSET_ID).catch(() => {})

  for (const asset of LEGACY_ASSETS) {
    const stillLegacy = await client.fetch<number>(
      `count(*[_type == "recipe" && heroImage.asset._ref == $assetId])`,
      {assetId: asset.oldAssetId},
    )

    if (stillLegacy === 0) {
      console.log(`→ Skipping ${asset.title} (already migrated)`)
      continue
    }

    console.log(`→ Migrating ${asset.title}`)

    const {heroImage, linkedAssetId, mediaLibraryAssetId} = await migrateImageUrlToMediaLibrary({
      token,
      projectId,
      dataset,
      imageUrl: asset.imageUrl,
      filename: asset.filename,
      title: asset.title,
    })

    const recipes = await client.fetch<Array<{_id: string}>>(
      `*[_type == "recipe" && heroImage.asset._ref == $assetId]{_id}`,
      {assetId: asset.oldAssetId},
    )

    for (const recipe of recipes) {
      await client.patch(recipe._id).set({heroImage}).commit()
      console.log(`  ✓ linked ${recipe._id}`)
    }

    const draftRecipes = await client.fetch<Array<{_id: string}>>(
      `*[_type == "recipe" && heroImage.asset._ref == $assetId && _id in path("drafts.**")]{_id}`,
      {assetId: asset.oldAssetId},
    )

    for (const draft of draftRecipes) {
      await client.delete(draft._id).catch(() => {})
    }

    const remainingRefs = await client.fetch<number>(`count(*[references($assetId)])`, {
      assetId: asset.oldAssetId,
    })

    if (remainingRefs === 0) {
      await client.delete(asset.oldAssetId).catch((error) => {
        console.warn(`  ! could not delete ${asset.oldAssetId}:`, error)
      })
      console.log(`  ✓ deleted legacy asset ${asset.oldAssetId}`)
    } else {
      console.warn(`  ! ${remainingRefs} reference(s) still point to ${asset.oldAssetId}`)
    }

    console.log(`  ✓ Media Library ${mediaLibraryAssetId} → dataset ${linkedAssetId}`)
  }

  console.log('Migration complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
