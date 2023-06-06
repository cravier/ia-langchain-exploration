import 'dotenv/config'

import { Document } from "langchain/document";
import { bufferMemoryChatChain, langchainStuffDocumentsChain, bufferMemoryChatQAChain } from './lib/langchain.mjs';

/**
 * Use case 1:
 * Question/answer on our private data.
 * No chat history, just one shot question/answer
 */

// const docs = [
//   new Document({ pageContent: "Harrison went to Harvard." }),
//   new Document({ pageContent: "Ankush went to Princeton." }),
// ];

// const question = "Where did Ankush go to college?"
// const response = await langchainStuffDocumentsChain(docs, question)
// console.log(response)

/**
 * Use case 2:
 * ChatOpenAI that keep history in buffer memory
 * But du not answer from our private data
 */

// await bufferMemoryChatChain()

/**
 * Use case 3:
 * ChatOpenAI that keep history in buffer memory
 * Answer by taking into account the private data we are feeding him with.
 */

const docs = [
  new Document({ pageContent: "The president said Justice Breyer is good guy." }),
  // new Document({ pageContent: "However the president was in a very good mood, better than usual." }),
  new Document({ pageContent: "However the president was in a very good mood, but no more than usual." }),
];

await bufferMemoryChatQAChain(docs)