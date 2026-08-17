document.addEventListener('DOMContentLoaded', function () {
    const sendBtn = document.querySelector('.send_btn');
    const messageInput = document.querySelector('.newmessage_input');
    const chatlog = document.querySelector('.chatlog');

    function appendUserMessage(text) {
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }

        const box = document.createElement('div');
        box.className = 'usermessage_box';

        const message = document.createElement('div');
        message.className = 'usermessage';

        const paragraph = document.createElement('p');
        paragraph.textContent = trimmed;

        message.appendChild(paragraph);
        box.appendChild(message);
        chatlog.appendChild(box);
        chatlog.scrollTop = chatlog.scrollHeight;

        messageInput.value = '';
        messageInput.focus();
    }

    function sendMessage() {
        appendUserMessage(messageInput.value);
    }

    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
});
