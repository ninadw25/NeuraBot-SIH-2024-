// Select the necessary DOM elements
const submitBtn = document.querySelector(".submit-btn");
const fileInput = document.querySelector(".file-input");
const chatArea = document.querySelector(".chat-area");

// Function to create a chat box for the user's uploaded file
function createUserChatBox(fileName) {
  let userChat = document.createElement("div");
  userChat.textContent = `File uploaded: ${fileName}`;
  userChat.classList.add("user-chat");
  chatArea.appendChild(userChat);
}

// Function to create a chat box for the server's summarization response
function createResponseChatBox(summary) {
  let responseChatBox = document.createElement("div");
  responseChatBox.textContent = summary;
  responseChatBox.classList.add("response-chat");
  chatArea.appendChild(responseChatBox);
}

// Function to handle the file upload and summarization process
async function submitFile() {
  const file = fileInput.files[0]; // Get the first selected file

  if (!file) {
    alert("Please select a PDF file.");
    return;
  }

  createUserChatBox(file.name);

  try {
    const formData = new FormData();
    formData.append('file', file);

    let response = await fetch('/summarize', {
      method: 'POST',
      body: formData
    });

    let result = await response.json();
    if (response.ok) {
      createResponseChatBox(result.summary);
    } else {
      createResponseChatBox(result.error || "Sorry, something went wrong.");
    }
  } catch (error) {
    console.error(error);
    createResponseChatBox("Sorry, something went wrong.");
  }
}


// Add event listeners for button click and file upload
submitBtn.addEventListener("click", submitFile);
