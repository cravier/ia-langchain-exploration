import { OpenAI } from "langchain/llms/openai"
import { ConversationChain, ConversationalRetrievalQAChain, ConversationalRetrievalQAChainInput, loadQAStuffChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";

export const langchainStuffDocumentsChain = async (input_documents, question) => {
  const llm = new OpenAI({ temperature: 0.9 });
  const chain = loadQAStuffChain(llm);
  const response = await chain.call({ input_documents, question });
  return response;
};

export const bufferMemoryChatChain = async () => {
  const chat = new ChatOpenAI({ temperature: 0 });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
    prompt: chatPrompt,
    llm: chat,
  });

  const response = await chain.call({ input: "hi! whats up?" });
  console.log(response);

  const response2 = await chain.call({ input: "What was my last question?" });
  console.log(response2);

  const response3 = await chain.call({ input: "Where did Harrison go to college?" })
  console.log(response3);

  const response4 = await chain.call({ input: "Did I ever ask you something about Harison" })
  console.log(response4);
}

export const bufferMemoryChatQAChain = async (documents) => {
  const model = new OpenAI({ temperature: 0 });
  const vectorStore = await HNSWLib.fromDocuments(documents, new OpenAIEmbeddings())

  // Compute chain object
  const options = { memory: new BufferMemory({ memoryKey: "chat_history" }) }
  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(2), options)

  // First question on the documents context
  const question = "What did the president say about Justice Breyer?";
  const response = await chain.call({ question });
  console.log(response);

  // Second question that use the history
  const question2 = await chain.call({ question: "Was that nice?" });
  console.log(question2);

  const question3 = await chain.call({ question: "Do you think the president said that because he was in a good mood ?" });
  console.log(question3);

  const question4 = await chain.call({ question: "What is the meteo today" });
  console.log(question4);
}