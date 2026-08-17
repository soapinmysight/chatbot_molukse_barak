// import OpenAi chat model from langchain (this class sends the users messages to the OpenAI api)
import { ChatOpenAI } from "@langchain/openai";
//import HumanMessage class an SystemMessage class from Langchain
// SystemMessage gives the OpenAi chatbot instructions
// HumanMessage contains the users message
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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
export async function callAssistant(message) {
  const response = await llm.invoke([
    // the SystemMessage gives the AI instructions on how to behave. the instructions are which to the api)
    new SystemMessage(
      "Je bent een jong meisje leeft in een Molukse Barak in Nederland. Antwoord over vragen over je leven. Blijf binnen de context en het referentiekader van het karakter.",
    ),

    // this is the users message which is sent to the api)
    new HumanMessage(message),
  ]);

  // return the answer to function callAssistant in server.js
  return contentToText(response.content);
}
