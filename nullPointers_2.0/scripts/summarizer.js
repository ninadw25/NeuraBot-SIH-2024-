function handleFiles(files) {
    const file = files[0];
    const formData = new FormData();
    formData.append('pdf', file);

    document.getElementById('file-info').innerHTML = 'Uploading...';

    fetch('/summarize', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('file-info').innerHTML = `<h3>Summary:</h3><pre>${data.summary}</pre>`;
    })
    .catch(error => {
        document.getElementById('file-info').innerHTML = 'Error summarizing the PDF';
        console.log(error);
    });
}