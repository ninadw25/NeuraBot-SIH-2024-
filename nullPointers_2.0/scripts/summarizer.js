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
async function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        const formData = new FormData();
        formData.append('pdf', file);

        successMessage.classList.remove('hidden');
        initialState.style.display = 'none';
        popup.style.display = 'block';

        try {
            const response = await fetch('/summarize/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            window.pdfSummary = data.summary;
            window.pdfFilename = data.filename;
        } catch (error) {
            console.error('Error summarizing the PDF:', error);
            window.pdfSummary = 'Error occurred while summarizing the PDF.';
        }
    }
}

function showSummarizer() {
    popup.style.display = 'none';
    uploadContainer.style.display = 'none';
    summaryArea.style.display = 'block';
    
    const summaryText = document.getElementById('summary-text');
    if (window.pdfSummary) {
        summaryText.innerHTML = marked.parse(window.pdfSummary);
    } else {
        summaryText.textContent = 'Summary is being generated. Please wait...';
        const summaryChecker = setInterval(() => {
            if (window.pdfSummary) {
                summaryText.innerHTML = marked.parse(window.pdfSummary);
                clearInterval(summaryChecker);
            }
        }, 1000);
    }
}

function showChat() {
    popup.style.display = 'none';
    uploadContainer.style.display = 'none';
    chatBox.style.display = 'flex';
}

const chatInput = document.getElementById('chat-input');
chatInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

async function sendMessage() { 
    const message = chatInput.value.trim();
    if (message !== '') {
        const chatMessages = document.getElementById('chat-messages');
        
        const userMessageElement = document.createElement('div');
        userMessageElement.textContent = `You: ${message}`;
        userMessageElement.classList.add('user-message');
        chatMessages.appendChild(userMessageElement);
        
        chatInput.value = '';
        
        try {
            const response = await fetch('/summarize/chatApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, pdfSummary: window.pdfSummary }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get response from server: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            const assistantMessageElement = document.createElement('div');
            assistantMessageElement.innerHTML = marked.parse(data.response);
            assistantMessageElement.classList.add('assistant-message');
            chatMessages.appendChild(assistantMessageElement);
        } catch (error) {
            console.error('Error in chat:', error);
            
            const errorElement = document.createElement('div');
            errorElement.textContent = `Error: ${error.message}`;
            errorElement.classList.add('error-message');
            chatMessages.appendChild(errorElement);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function deletePDF() {
    if (window.pdfFilename) {
        fetch(`/summarize/delete/${window.pdfFilename}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('PDF deleted successfully');
                summaryArea.style.display = 'none';
                chatBox.style.display = 'none';
                uploadContainer.style.display = 'block';
                initialState.style.display = 'block';
                successMessage.classList.add('hidden');
                window.pdfSummary = null;
                window.pdfFilename = null;
                document.getElementById('chat-messages').innerHTML = '';
            } else {
                throw new Error('Failed to delete PDF');
            }
        })
        .catch(error => {
            console.error('Error deleting PDF:', error);
            alert('Error deleting PDF');
        });
    }
}