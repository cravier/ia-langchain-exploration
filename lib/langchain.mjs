import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";

// Vectorial database related imports
import weaviate from "weaviate-ts-client";
import { WeaviateStore } from "langchain/vectorstores/weaviate";

const indexName = "Bibindex";

export const loadData = async () => {
  // 1. Create a weaviate client
  const weaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_SCHEME || "https",
    host: process.env.WEAVIATE_HOST || "localhost",
    apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || "default"),
  });

  // 2. Create a weaviate store with the most iconic landmarks without saying the country
  await WeaviateStore.fromTexts(
    [
      "The Great Wall of China :Ancient fortification spanning thousands of miles, symbolizing  rich history and impressive engineering.",
      "The Eiffel Tower : Iconic iron lattice tower in Paris, offering breathtaking views and representing architectural brilliance.",
      "The Taj Mahal : Magnificent mausoleum in Agra, renowned for its beauty, intricate craftsmanship, and eternal love story.",
      "The Statue of Liberty : Iconic symbol of freedom in New York City, welcoming immigrants and representing democratic ideals.",
      "The Pyramids of Giza : Majestic ancient structures, showcasing the ingenuity and cultural significance of the pharaohs.",
    ],
    [
      { continent: "asia" },
      { continent: "europe" },
      { continent: "asia" },
      { continent: "america" },
      { continent: "africa" },
    ],
    new OpenAIEmbeddings(),
    {
      client: weaviateClient,
      indexName: indexName,
      textKey: "text",
      metadataKeys: ["continent"],
    }
  );

  return weaviateClient
}

export const run = async (weaviateClient) => {
  const model = new ChatOpenAI({ temperature: 0.2 });

  // Create a weaviate store from an existing index
  const weaviateStore = await WeaviateStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client: weaviateClient,
      indexName: indexName,
      metadataKeys: ["continent"],
    }
  );
  
  // Compute chain object
  const retriever = weaviateStore.asRetriever(1)
  const options = { memory: new BufferMemory({ memoryKey: "chat_history" }) }
  const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever , options)

  // First question on the documents context
  const question = "What is the great wall ?";
  const response = await chain.call({ question });
  console.log(response);
}