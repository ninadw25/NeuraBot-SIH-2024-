const submitBtn = document.querySelector(".submit-btn");
const promptInput = document.querySelector(".prompt-input");
const chatArea = document.querySelector(".chat-area");

function createUserChatBox(prompt) {
  let userChat = document.createElement("div");
  userChat.textContent = prompt;
  userChat.classList.add("user-chat");
  chatArea.appendChild(userChat);
}
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

document.addEventListener('click', (event) => {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnHamburger = hamburgerMenu.contains(event.target);

  if (!isClickInsideSidebar && !isClickOnHamburger && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
  }
});
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
      // Use marked to render Markdown
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

// Configure marked options for better rendering
marked.setOptions({
  breaks: true, // Adds <br> on single line breaks
  gfm: true,    // GitHub Flavored Markdown
});