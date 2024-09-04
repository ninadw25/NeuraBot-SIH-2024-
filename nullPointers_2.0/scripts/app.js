const fs = require('fs');
const submitBtn = document.querySelector(".submit-btn");
const promptInput = document.querySelector(".prompt-input");
const chatArea = document.querySelector(".chat-area");


function createUserChatBox(prompt) {
  let userChat = document.createElement("div");
  userChat.textContent = prompt;
  userChat.classList.add("user-chat");
  chatArea.appendChild(userChat);
}

async function createResponseChatBox(prompt) {
  let responseChatBox = document.createElement("div");
  try {
    let response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    });

    let result = await response.json();
    if (response.ok) {
      responseChatBox.textContent = result.response;
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

submitBtn.addEventListener("click", async (event) => {
  console.log("button clicked");
  const question = promptInput.value;
  fs.readFile('../assets/documents/document.txt', "utf-8", async (err, context) => {
    if(err){
      console.log("Error extracting data from pdf file: ", err);
    }
    else{
      const prompt = `Based on the following context, answer the question without providing information outside of it:\n${context}\n\nQuestion: ${question}`;
      if(prompt.trim() === "") {
        return;
      }
      createUserChatBox(prompt);
      await createResponseChatBox(prompt);
    }
  });
});