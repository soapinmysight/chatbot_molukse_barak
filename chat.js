// import OpenAi chat model from langchain (this class sends the users messages to the OpenAI api)
import { ChatOpenAI } from "@langchain/openai";

//import HumanMessage class an SystemMessage class from Langchain
import {
  AIMessage, // AIMessage contains the answer from the AI
  HumanMessage, // HumanMessage contains the users message
  SystemMessage // SystemMessage gives the OpenAi chatbot instructions
} from "@langchain/core/messages";

// check if the key does not exist in the env file(process.env reads the value OPENAI_API_KEY from the .env file)
if (!process.env.OPENAI_API_KEY) {
  // if the key does not exist, throw error
  throw new Error(
    "OPENAI_API_KEY ontbreekt. Kopieer .env.example naar .env en vul je API-key in.",
  );
}

// create const to hold the OpenAi chat model
const llm = new ChatOpenAI({
  // secret key from env is send to OpenAi
  apiKey: process.env.OPENAI_API_KEY,
  // use the model specified in env
  model: process.env.OPENAI_MODEL,
});

// Store a separate chat history for every user.
const userChats = new Map();

// Every chat starts with this system message.
const systemPrompt = new SystemMessage(
  "Je bent een jong meisje leeft in een Molukse Barak in Nederland. Antwoord over vragen over je leven. Blijf binnen de context en het referentiekader van het karakter.",
);

// Get or create the history for one user.
function getUserChat(userId) {
  // Check if this user does not have a history yet.
  if (!userChats.has(userId)) {
    // Create a new history containing the system message.
    userChats.set(userId, [systemPrompt]);
  }

  // Return this user's history.
  return userChats.get(userId);
}

//check to see if the respones holds text, if so return it
function contentToText(content) {
  // if the content is a string, just return content to server
  if (typeof content === "string") {
    return content;
  }

  // but sometimes the content is an array of objects instead a string, so if the response is an array;
  if (Array.isArray(content)) {
    console.log("The response is a list of seperate blocks (array of objects)") //this log can be removed later
    return content
      //convert each block into text
      .map((block) => {
        //a block can sometimes be a string, in that case just return
        if (typeof block === "string") return block;
        // ? checks if block type is text and if it is text, if it holds a string
        // in that case return it
        if (block?.type === "text" && typeof block.text === "string") {
          return block.text;
        }
        // ignore blocks that dont hold text
        return "";
      })
      //join the text blocks into one string
      .join("");
  }

  // if non of the format options given are the case (not a string, not an array)
  // return an empty text to server
  console.log("format of response content is not string or array. returning empty text to server")
  return "";
}

// this function is exported, so that server.js can import it
// message parameter is used so that server can send the message to the api
export async function callAssistant(userId, message) {
  // use saved history when a userId was provided
  // otherwise create a temporary chat without history
  const messages = userId
    ? getUserChat(userId)
    : [systemPrompt];

  // add the new question before calling OpenAI
  // the model can now read the new question and previous history
  messages.push(new HumanMessage(message));

  // send the complete conversation to OpenAI
  const response = await llm.invoke(messages);

  // save the AI response only when history is enabled
  if (userId) {
    messages.push(response);
  }

  // get the tokens used by this API call
  const tokens = response.usage_metadata?.total_tokens ?? 0;

  console.log(`Tokens used: ${tokens}`);

  // send the answer and token usage back to server.js
  return {
    message: contentToText(response.content),
    tokens: tokens,
  };
}

// return the last 10 messages for one user
export function getUserHistory(userId) {
  // use an empty array when this user has no history
  const messages = userChats.get(userId) ?? [];

  return messages
    // do not send the hidden system message to the browser
    .filter(
      (message) =>
        message instanceof HumanMessage ||
        message instanceof AIMessage,
    )
    // only return the last 10 messages
    .slice(-10)
    // convert LangChain messages into simple JSON objects
    .map((message) => {
      const isUserMessage = message instanceof HumanMessage;

      return {
        role: isUserMessage ? "user" : "assistant",
        message: contentToText(message.content),

        // only AI messages contain token information
        tokens: isUserMessage
          ? undefined
          : message.usage_metadata?.total_tokens ?? 0,
      };
    });
}
