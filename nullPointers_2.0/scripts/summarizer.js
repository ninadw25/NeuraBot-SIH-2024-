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

        // Fetch the `/upload` endpoint to send the file for summarization
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Store the summary for later use
            window.pdfSummary = data.summary;
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
    
    // Display the summary or a loading message
    const summaryText = document.getElementById('summary-text');
    if (window.pdfSummary) {
        summaryText.textContent = window.pdfSummary;
    } else {
        summaryText.textContent = 'Summary is being generated. Please wait...';
        // Check for summary every second
        const summaryChecker = setInterval(() => {
            if (window.pdfSummary) {
                summaryText.textContent = window.pdfSummary;
                clearInterval(summaryChecker);
            }
        }, 1000);
    }
}

// Show Chatbox
function showChat() {
    popup.style.display = 'none';
    uploadContainer.style.display = 'none';
    chatBox.style.display = 'flex';
}

// Send message in chat
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (message.trim() !== '') {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        input.value = '';
    }
}