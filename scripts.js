async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value.trim();

    if (message === "") return;

    addMessage("user", message);
    inputField.value = ""; 

    const sendButton = document.getElementById('send-btn');
    sendButton.disabled = true;

    try {
        // Send request to FastAPI backend instead of OpenAI directly
        const response = await fetch("http://127.0.0.1:8000/generate", {  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: message }),
        });

        const data = await response.json();

        // Use FastAPI response format
        const botResponse = data.response.trim();  

        addMessage("bot", botResponse);

    } catch (error) {
        console.error("Error:", error);
        addMessage("bot", "Sorry, something went wrong.");
    } finally {
        sendButton.disabled = false; 
    }
}

function addMessage(sender, text) {
    const chatBox = document.getElementById("chat-content");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('new-chat').addEventListener('click', () => {
    document.getElementById("chat-content").innerHTML = '';
});

function saveConversation() {
    const chatContent = document.getElementById("chat-content").innerHTML;
    const topic = document.getElementById("userInput").value.trim() || 'Untitled';  
    if (chatContent && topic) {
        const key = `savedChat_${topic}`;
        localStorage.setItem(key, chatContent);
        alert(`Conversation saved as "${topic}"`);
        loadSavedConversations();
    } else {
        alert('Please send a message before saving.');
    }
}

document.getElementById('save-btn').addEventListener('click', saveConversation);

function loadSavedConversations() {
    const savedConversationsList = document.getElementById('saved-conversations-list');
    savedConversationsList.innerHTML = '';  

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('savedChat_')) {
            const topic = key.replace('savedChat_', '');
            const listItem = document.createElement('li');
            listItem.textContent = topic;
            listItem.addEventListener('click', () => loadSavedConversation(topic));
            savedConversationsList.appendChild(listItem);
        }
    }
}

function loadSavedConversation(topic) {
    const savedChat = localStorage.getItem(`savedChat_${topic}`);
    if (savedChat) {
        document.getElementById("chat-content").innerHTML = savedChat;
    } else {
        alert('Conversation not found!');
    }
}

window.onload = () => {
    loadSavedConversations();
};
