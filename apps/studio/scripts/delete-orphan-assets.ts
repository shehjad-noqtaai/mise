import {getCliClient} from 'sanity/cli'
import {deleteMediaLibraryAsset} from '../lib/media-library.ts'

const ORPHAN_DATASET_ASSETS = ['image-1866bb2f965e90853aa8b7a12eb1b4d1f873ca04-1408x768-jpg']

async function main() {
  const cli = getCliClient()
  const {token} = cli.config()
  if (!token) throw new Error('Missing auth token')

  const client = cli.withConfig({useCdn: false, token})

  for (const assetId of ORPHAN_DATASET_ASSETS) {
    const refs = await client.fetch<number>(`count(*[references($assetId)])`, {assetId})
    if (refs === 0) {
      await client.delete(assetId)
      console.log(`Deleted dataset asset ${assetId}`)
    }
  }

  const orphanMediaAssets = await fetch(
    'https://api.sanity.io/v2025-02-19/media-libraries/mlZKouJfXE8F/query',
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        query: `*[_type == "sanity.asset" && title in ["Test Biryani", "Herbed Lentil Stew Hero"] && parent._ref != "3FguS2SUEa1KvNeHWh59arlqdXt"]{_id, title}`,
      }),
    },
  ).then((res) => res.json() as Promise<{result?: Array<{_id: string; title: string}>}>)

  for (const asset of orphanMediaAssets.result ?? []) {
    await deleteMediaLibraryAsset(token, asset._id)
    console.log(`Deleted Media Library orphan ${asset.title}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
