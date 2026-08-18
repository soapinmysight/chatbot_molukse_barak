// wait until html is loaded
document.addEventListener("DOMContentLoaded", function () {

    // find send button in html and put it in a const
    const sendBtn = document.querySelector(".send_btn");
    // find message input field in html and put it in a const
    const messageInput = document.querySelector(".newmessage_input");
    // find chatlog field and put it in a const
    const chatlog = document.querySelector(".chatlog");

    // variable to know if an api request is running or not
    let requestRunning = false;

    // function to automatically scroll to the newest message (at the bottom)
    function scrollToBottom() {
        // scrollheight is the full hieght og chat content
        chatlog.scrollTop = chatlog.scrollHeight;
    }

    // function to add a users message to the chatlog
    // it has the parameter text with the content of the message
    function appendUserMessage(text) {

        // (styling) create the html element for the outer user-message box
        const box = document.createElement("div");
        box.className = "usermessage_box"; //give it its css class

        // (styling) create the html element for the user-message element
        const message = document.createElement("div");
        message.className = "usermessage"; //give it its css class

        // create the html element <p></p> for the message content
        const paragraph = document.createElement("p");
        paragraph.textContent = text; // add the parameters value to this

        message.appendChild(paragraph); // put the <p></p> in the usermessage (styling)
        box.appendChild(message); // put the usermessage in the usermessage box
        chatlog.appendChild(box); // add the new usermessage box to chatlog

        scrollToBottom(); // call function to scroll to bottom so user sees the new message
    }

    // function to add loading bubble to botmessage_box
    function appendLoadingBubble() {
        // create the html element for the outer bot-message box
        const box = document.createElement("div");
        box.className = "botmessage_box"; //give it its css class

        // create the inner loading bubble
        const message = document.createElement("div");
        message.className = "botmessage loading-bubble"; // add the css classes (botmessage and loading-bubble)
        message.setAttribute("aria-label", "Loading"); //give screen readers a name for this bublle

        // create a dot (span element) 3 times to represent the loading dots (...)
        for (let i = 0; i < 3; i++) {
            message.appendChild(document.createElement("span"));
        }

        box.appendChild(message); // put message (loading bubble) in its outer box
        chatlog.appendChild(box); // add that box to chatlog

        scrollToBottom();

        return box;
    }

    // function to replace the loading dots with normal text.
    // it gets 2 parameters, the loadingbox and the text with content
    function replaceLoadingBubble(loadingBox, text, tokens) {
        // find the message bubble with in the outerbox
        const message = loadingBox.querySelector(".botmessage");

        // remove the css class that has the loading animation
        message.classList.remove("loading-bubble");
        message.removeAttribute("aria-label"); // remove the aria-label for screen readers as well

        // create a paragraph to add the text inside
        const paragraph = document.createElement("p");
        paragraph.textContent = text; // add the value of the text parameter to the paragraph

        // remove the loading dots and add the response
        message.replaceChildren(paragraph);

        // only add tokens if they are recieved (if they are a number)
        if (typeof tokens === "number") {
            // create small html element to put the token information in
            const tokenText = document.createElement("small");
            tokenText.className = "token_usage"; //give it a css class
            // add the number of tokens (value of parameter tokens) to the html element
            tokenText.textContent = `Tokens gebruikt: ${tokens}`;

            // put the token text inside the message
            message.appendChild(tokenText);
        }
        scrollToBottom();
    }

    // send users message to the server
    async function sendMessage() {
        // remove extra spaces from input and put it in a const
        const text = messageInput.value.trim();

        // stop if the input is emty or a request is already running
        if (!text || requestRunning) {
            return;
        }

        // add the users message to the chat with the function appendUserMessage and giving it the text as a parameter
        appendUserMessage(text);
        // empty the input field
        messageInput.value = "";
        // change the request running boolean to true
        requestRunning = true;

        // add loading class to the button so it looks and acts inactive (for criteria: submit button inactief tijdens verwerken prompt.)
        sendBtn.classList.add("loading");
        sendBtn.setAttribute("aria-disabled", "true"); // so that screenreaders can know the button is disables as well

        // show the loading bubble response from the AI role while waiting for the API
        const loadingBox = appendLoadingBubble();

        // try to send the message to the server! yippie
        try {
            // data flow: app.js --> server.js
            const apiResponse = await fetch("/api/chat", {
                method: "POST", // using post since were sending data
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: text }),
            });

            // await response from the ai! and put it into a const (data flow: server.js --> app.js)
            const data = await apiResponse.json();

            // check if server returned error
            if (!apiResponse.ok) {
                throw new Error(data.error);
            }

            // replace the loading bubble with the AI response
            replaceLoadingBubble(loadingBox, data.message, data.tokens);
        } catch (error) {
            console.error(error);

            // replace the loading bubble with an error message
            replaceLoadingBubble(
                loadingBox,
                "Er ging iets mis. Probeer het opnieuw.",
            );
        } finally { //this code runs after succes or failure
            requestRunning = false; //put boolean back so that new requests can be made
            sendBtn.classList.remove("loading"); //remove the loading class from button so it looks active
            sendBtn.removeAttribute("aria-disabled"); //remove inactive label for screen readers
            messageInput.focus();
        }
    }

    sendBtn.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});