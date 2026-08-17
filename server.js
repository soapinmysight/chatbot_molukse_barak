// express (extra package for node.js) creates the server and its api routes
import express from "express";
// import the function chat.js exported. server.js can use this to send a user's message o chat.js
import { callAssistant } from "./chat.js";

const app = express(); //create express application in a constante
const port = Number(process.env.PORT);//read port from env

app.use(express.json()); // so that Express can read JSON request bodies
app.use(express.static("public")); // so that Express can serve files in the public folder (so that the browser can display the website)

// test to check if the server works (can be removed later)
app.get("/api/test", (req, res) => {
  res.json({ response: "Hello world" });
});

// post route, the users message is send to this route
app.post("/api/chat", async (req, res) => {
  // data flow: Client (HTTPie or app.js) --> server.js
  // express puts the recieved json in req.body
  // the "message" value is taken out of that JSON object
const { message } = req.body;

// check to see if message is not empty, send error if empty
if (!message?.trim()) {
  return res.status(400).json({ error: "Vul een bericht in." });
}

  try {
    const response = await callAssistant(message.trim()); //await until function callAssistant from chat.js returns OpenAi's response
    return res.json({ response }); //return answer in json
  } catch (error) {
    console.error("OpenAI-aanroep mislukt:", error);
    return res.status(500).json({
      error: "De chatbot kon nu geen antwoord maken. Controleer de serverlog.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
