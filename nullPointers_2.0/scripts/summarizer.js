// Get DOM elements
const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('fileElem');
const browseLink = document.getElementById('browse-link');
const successMessage = document.getElementById('success-message');
const popup = document.getElementById('popup');
const initialState = document.getElementById('initial-state');
const chatBox = document.getElementById('chat-box');
const summaryArea = document.getElementById('summary-area');  

// Event listeners
browseLink.addEventListener('click', () => fileInput.click());

uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.classList.add('dragover');
});

uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.classList.remove('dragover');
});

uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// File handling function
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        const formData = new FormData();
        formData.append('pdf', file);

        successMessage.classList.remove('hidden');
        initialState.style.display = 'none';
        popup.style.display = 'block';

        // Fetch the /upload endpoint to send the file for summarization
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            window.pdfSummary = data.summary;
            window.pdfFilename = data.filename;
        })
        .catch(error => {
            console.error('Error summarizing the PDF:', error);
            window.pdfSummary = 'Error occurred while summarizing the PDF.';
        });
    }
}

// Show Summarizer
function showSummarizer() {
    popup.style.display = 'none';
    uploadContainer.style.display = 'none';
    summaryArea.style.display = 'block';
    
    const summaryText = document.getElementById('summary-text');
    if (window.pdfSummary) {
        summaryText.textContent = window.pdfSummary;
    } else {
        summaryText.textContent = 'Summary is being generated. Please wait...';
        const summaryChecker = setInterval(() => {
            if (window.pdfSummary) {
                summaryText.textContent = window.pdfSummary;
                clearInterval(summaryChecker);
            }
        }, 1000);
    }
}

// Show Chatbox when QnA is clicked
function showChat() {
    popup.style.display = 'none';
    uploadContainer.style.display = 'none';
    summaryArea.style.display = 'none'; // Hide summary if visible
    chatBox.classList.remove('hidden');
    chatBox.style.display = 'flex';
}

// Detect Enter key in chat input
const chatInput = document.getElementById('chat-input');
chatInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents a newline from being added
        sendMessage();
    }
});

// Send message in chat
async function sendMessage() { 
    const message = chatInput.value.trim();
    if (message !== '') {
        const chatMessages = document.getElementById('chat-messages');
        
        // Display user message
        const userMessageElement = document.createElement('div');
        userMessageElement.textContent = `You: ${message}`;
        userMessageElement.classList.add('user-message');
        chatMessages.appendChild(userMessageElement);
        
        // Clear input
        chatInput.value = '';
        
        
        try {
            const response = await fetch('/summarize/chatApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to get response from server: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
           
            
            // Display assistant's response
            const assistantMessageElement = document.createElement('div');
            assistantMessageElement.textContent = `Assistant: ${data.response}`;
            assistantMessageElement.classList.add('assistant-message');
            chatMessages.appendChild(assistantMessageElement);
        } catch (error) {
            console.error('Error in chat:', error);
            
           
            
            // Display error message
            const errorElement = document.createElement('div');
            errorElement.textContent = `Error: ${error.message}`;
            errorElement.classList.add('error-message');
            chatMessages.appendChild(errorElement);
        }
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}