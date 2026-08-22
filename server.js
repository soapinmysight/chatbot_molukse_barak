// express (extra package for node.js) creates the server and its api routes
import express from "express";
// import the function chat.js exported. server.js can use this to send a user's message o chat.js
import { callAssistant, getUserHistory, startUserChat } from "./chat.js";

const app = express(); //create express application in a const
const port = Number(process.env.PORT);//read port from env and put in a const

app.use(express.json()); // so that Express can read JSON request bodies
app.use(express.static("public")); // so that Express can serve files in the public folder (so that the browser can display the website)

// post route to start a chat history after username is entered
app.post("/api/startchat", (req, res) => {
  // gett the user ID and username sent by app.js and put it in a const
  const { userId, username } = req.body;

  // add the first message, username and automatic response to this user's chat history.
  const response = startUserChat(
    userId,
    username.trim(),
  );

  // send the automatic response back to app.js.
  return res.json(response);
});

// post route, the users message is send via this route
app.post("/api/chat", async (req, res) => {
  // data flow: Client (app.js or HTTPie) --> server.js

  // get the userID and message from the recieved json
  const { userId, message } = req.body;

  // check to see if message is not empty, send error if empty
  if (!message?.trim()) {
    return res.status(400).json({ error: "Vul een bericht in." });
  }

  try {
    //await until function callAssistant from chat.js returns OpenAi's response
    const response = await callAssistant(userId, message.trim());
    return res.json(response); //return answer in json

  } catch (error) {
    console.error("OpenAI-aanroep mislukt:", error);
    return res.status(500).json({
      error: "De chatbot kon nu geen antwoord maken. Controleer de serverlog.",
    });
  }
});

// return the last 10 messages for one user
app.post("/api/gethistory", (req, res) => {
  // get the user ID sent by app.js
  const { userId } = req.body;

  // a user without an ID has no saved history
  if (!userId) {
    return res.json([]);
  }

  // get this user's history from chat.js
  const history = getUserHistory(userId);

  // send the history to app.js
  return res.json(history);
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
