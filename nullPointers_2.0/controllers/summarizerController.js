const fs = require('fs');
const { spawn } = require('child_process');
const upload = require('../utils/multerSetup');

summarizerRender = (req, res) => {
    res.render('summarizer');
};

summarizer = (req, res) => {
    if (!req.file) {
        return res.status(413).send('File not uploaded!');
    }

    const pdfFilePath = req.file.path;

    const pythonProcess = spawn('python3', ['../apps/summarizer.py', pdfFilePath]);

    let summary = '';

    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).send('Error occurred while summarizing PDF');
        }
        // Send the summary as JSON response
        try {
            const parsedSummary = JSON.parse(summary);
            res.status(200).json(parsedSummary);
        } catch (error) {
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