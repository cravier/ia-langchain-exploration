import 'dotenv/config'

import { loadData, run } from './lib/langchain.mjs';

const weaviateClient = await loadData()
await run(weaviateClient)
