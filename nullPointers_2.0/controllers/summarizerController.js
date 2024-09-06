const fs = require('fs');
const { spawn } = require('child_process');
const upload = require('../utils/multerSetup');

// Render the summarizer page
const summarizerRender = (req, res) => {
    res.render('summarizer');
};

// Summarizer function to handle the PDF upload and summarization
summarizer = (req, res) => {
    if (!req.file) {
        return res.status(400).send('File not uploaded!');
    }

    const pdfFilePath = req.file.path;

    const pythonProcess = spawn('python', ['./apps/summarizer.py', pdfFilePath]);

    let summary = '';
    let errorOutput = '';

    // Capture output data from Python
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    // Capture error output from Python
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Handle Python process exit
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('Error occurred while summarizing PDF:', errorOutput); // Log the error to server console
            return res.status(500).send('Error occurred while summarizing PDF');
        }

        try {
            const parsedSummary = JSON.parse(summary);
            res.status(200).json(parsedSummary);
        } catch (error) {
            console.error('Error parsing summary:', error); // Log the JSON parsing error
            res.status(500).send('Error parsing summary');
        }

        fs.unlinkSync(pdfFilePath);
    });
};

module.exports = {
    summarizerRender,
    summarizer,
    upload
};