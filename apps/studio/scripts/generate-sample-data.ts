/**
 * Write static Mise sample data to NDJSON for bootstrap import.
 *
 * Usage: pnpm generate-sample-data
 */
import {createWriteStream} from 'node:fs'
import {allMiseDocuments} from './seed/mise-data.ts'

const OUT_FILE = 'sample-data.ndjson'

async function main() {
  const out = createWriteStream(OUT_FILE)
  const docs = allMiseDocuments()

  for (const doc of docs) {
    out.write(`${JSON.stringify(doc)}\n`)
  }

  await new Promise<void>((resolve, reject) =>
    out.end((err?: Error) => (err ? reject(err) : resolve())),
  )

  process.stderr.write(`✓ Wrote ${docs.length} documents to ${OUT_FILE}\n`)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
