// app.js (Client-Side)

const submitBtn = document.querySelector(".submit-btn");
const promptInput = document.querySelector(".prompt-input");
const chatArea = document.querySelector(".chat-area");
// When the page loads, the bot asks the first question
window.onload = async function() {
  const defaultPrompt = "What policies are mentioned in this document. Give bullet points?";
  await createResponseChatBox(defaultPrompt); // Get bot response
};

function createUserChatBox(prompt) {
  let userChat = document.createElement("div");
  userChat.textContent = prompt;
  userChat.classList.add("user-chat");
  chatArea.appendChild(userChat);
}

async function createResponseChatBox(prompt) {
  let responseChatBox = document.createElement("div");
  try {
    let response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    });

    let result = await response.json();
    if (response.ok) {
      responseChatBox.innerHTML = marked.parse(result.response);
    } else {
      responseChatBox.textContent = result.error || "Sorry, something went wrong.";
    }
  } catch (error) {
    console.error(error);
    responseChatBox.textContent = "Sorry, something went wrong.";
  }
  responseChatBox.classList.add("response-chat");
  chatArea.appendChild(responseChatBox);
}

async function submitPrompt() {
  const question = promptInput.value;
  promptInput.value = "";
  createUserChatBox(question);

  if (question.trim() === "") {
    return;
  }
  await createResponseChatBox(question);
}

submitBtn.addEventListener("click", submitPrompt);

promptInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    submitPrompt();
  }
});

marked.setOptions({
  breaks: true,
  gfm: true,
});

// Send a request to clear the chat session when user exits the bot
window.onbeforeunload = async function() {
  await fetch('/chat/clear-session', {
    method: 'POST',
  });
};
