document.addEventListener("DOMContentLoaded", function () {
    const chatContent = document.getElementById("chat-content");
    const inputField = document.getElementById("userInput");
    const sendButton = document.getElementById("send-btn");
    const saveButton = document.getElementById("save-btn");
    const sidebarList = document.getElementById("saved-conversations-list");

    let conversations = JSON.parse(localStorage.getItem("conversations")) || {};
    let currentConversation = null;

    function addMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        messageDiv.textContent = text;
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    function appendMessage(content, sender) {
        addMessage(sender, content);
        if (currentConversation) {
            conversations[currentConversation].push({ sender, content });
            localStorage.setItem("conversations", JSON.stringify(conversations));
        }
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement("div");
        typingIndicator.classList.add("message", "bot-message");
        typingIndicator.id = "typing-indicator";
        typingIndicator.textContent = "Typing...";
        chatContent.appendChild(typingIndicator);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) typingIndicator.remove();
    }

    async function fetchBotResponse(userMessage) {
        showTypingIndicator();
        try {
            const response = await fetch("http://127.0.0.1:8000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userMessage }),
            });

            removeTypingIndicator();
            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            appendMessage(data.response.trim(), "bot");
        } catch (error) {
            removeTypingIndicator();
            appendMessage("⚠️ Error: Could not connect to the server.", "bot");
        }
    }

    function createNewConversation(firstMessage) {
        const conversationName = firstMessage.slice(0, 20).trim() || "Untitled Chat";
        let uniqueName = conversationName;
        let count = 1;
        while (conversations[uniqueName]) {
            uniqueName = `${conversationName} (${count})`;
            count++;
        }

        currentConversation = uniqueName;
        conversations[currentConversation] = [{ sender: "bot", content: "Welcome! How can AI support your startup journey today?" }];
        localStorage.setItem("conversations", JSON.stringify(conversations));

        addConversationToSidebar(currentConversation);
        loadConversation(currentConversation);
    }

    sendButton.addEventListener("click", function () {
        const userMessage = inputField.value.trim();
        if (!userMessage) return;

        if (!currentConversation) {
            createNewConversation(userMessage);
        }

        appendMessage(userMessage, "user");
        inputField.value = "";
        inputField.focus();

        fetchBotResponse(userMessage);
    });

    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendButton.click();
    });

    function addConversationToSidebar(name) {
        if ([...sidebarList.children].some((li) => li.textContent === name)) return;

        const li = document.createElement("li");
        li.textContent = name;
        li.addEventListener("click", function () {
            loadConversation(name);
        });
        sidebarList.appendChild(li);
    }

    function loadConversation(name) {
        currentConversation = name;
        chatContent.innerHTML = "";
        (conversations[name] || []).forEach((msg) => appendMessage(msg.content, msg.sender));
    }

    function loadSavedConversations() {
        Object.keys(conversations).forEach(addConversationToSidebar);
    }

    document.getElementById("new-chat").addEventListener("click", function () {
        currentConversation = null;
        chatContent.innerHTML = "";
        appendMessage("Welcome! How can AI support your startup journey today?", "bot");
    });

    saveButton.addEventListener("click", function () {
        const chatContentHtml = chatContent.innerHTML;
        const topic = inputField.value.trim() || 'Untitled';
        if (chatContentHtml && topic) {
            const key = `savedChat_${topic}`;
            localStorage.setItem(key, chatContentHtml);
            alert(`Conversation saved as "${topic}"`);
            loadSavedConversations();
        } else {
            alert('Please send a message before saving.');
        }
    });

    loadSavedConversations();
});