const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "your-api-key-here"; // Make sure to replace with your valid OpenAI API key

// Hardcoded part of the prompt for meal planning
const hardcodedPrompt = "Create a 7-day meal plan, corresponding recipes with macros such as calories, carbs, protein, and fiber in grams, and a shopping list for the ingredients of the recipes for the following preferences, dietary restrictions, nutrition goals: ";

// Load chat data from local storage
const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Meal Plan GPT</h1>
                            <p>Please specify your meal plan preferences, any dietary restrictions (allergies, vegetarian, keto), nutrition goals (ie. protein, fiber)<br> We will generate a 7 day meal plan, recipes, and ingredients lists. </p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
};

// Create new chat element
const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

// Get response from GPT
const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText, // Using hardcoded prompt with user input
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const responseData = await response.json();

        // Log the response for debugging
        console.log(responseData);

        if (response.ok) {
            pElement.textContent = responseData.choices[0].text.trim();
        } else {
            pElement.classList.add("error");
            pElement.textContent = `Error: ${responseData.error.message}`;
        }
    } catch (error) {
        // Add error class to the paragraph element and set error text
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
        console.error("Fetch error: ", error); // Log the error for debugging
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Copy response to clipboard
const copyResponse = (copyBtn) => {
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
};

// Show typing animation while waiting for GPT response
const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
};

// Handle outgoing chat
const handleOutgoingChat = () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    // Concatenate the hardcoded prompt with user input
    userText = hardcodedPrompt + userInput;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <p>${userInput}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
};

// Delete chats from local storage
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

// Toggle theme
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

// Adjust input height dynamically
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Handle enter key for sending chat
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Load previous chats and theme on page load
loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
