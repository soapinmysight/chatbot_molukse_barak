# Molukse Barak Simulator

## Project description

Molukse Barak Simulator is an educational chatbot. The user talks with Kirana Latuheru, a fictional 12-year-old Molukse girl living in Kamp Lage Mierde in 1952.

The chatbot uses Node.js, Express, LangChain and the OpenAI API. The frontend uses HTML, CSS and JavaScript.

The user can send messages through a chat interface. AI answers are shown with Markdown formatting and show token usage for each AI answer. Users can chat through username to save chat history per user. They can also chat without a username, but then they'll have no chat history. When reloading the page the last 10 saved messages are shown. When the server gets restarted, all personal chat histories get removed but username and userID remain as those are in the browsers local storage.

## Installation

1. Install Node.js.
2. Download or clone this project.
3. Open a terminal in the project folder.
4. Install the packages:

```bash
npm install
```

5. Creat an env file `.env`.
6. Purchase an OpenAI API key at https://platform.openai.com
7. Add your OpenAI API key and model to `.env`:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=your_model
PORT=3000
```
For model, I used gpt-5-nano as it's cheap but any model can be used.

7. Start the server:

```
npm run dev
```

8. Open this address in your browser:

```text
http://localhost:3000
```

Never share your `.env` file or API key.

## Disclaimer

Kirana is a fictional character. The chatbot is an educational proof of concept and should not be treated as a complete historical source.
