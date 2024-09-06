function handleFiles(files) {
    const file = files[0];  // Get the selected file
    const formData = new FormData();
    formData.append('pdf', file);  // Append the PDF file to FormData

    document.getElementById('file-info').innerHTML = 'Uploading and summarizing...';

    // Fetch the `/upload` endpoint to send the file for summarization
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Display the summary in the file-info div
        document.getElementById('file-info').innerHTML = `<h3>Summary:</h3><pre>${data.summary}</pre>`;
    })
    .catch(error => {
        // Handle errors during the process
        document.getElementById('file-info').innerHTML = 'Error summarizing the PDF';
        console.error(error);
    });
}