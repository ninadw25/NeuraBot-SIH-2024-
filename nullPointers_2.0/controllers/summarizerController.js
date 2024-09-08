const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
const pdf = require('pdf-parse');

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'uploaded_pdf.pdf');
    }
});

const upload = multer({ storage: storage });

// Render the summarizer page
const summarizerRender = (req, res) => {
    res.render('summarizer');
};

// Summarizer function to handle the PDF upload and summarization
const summarizer = (req, res) => {
    if (!req.file) {
        return res.status(400).send('File not uploaded!');
    }

    const pdfFilePath = req.file.path;
    const textFilePath = path.join(__dirname, '../uploads/document.txt');

    // Delete previous document.txt file if it exists
    if (fs.existsSync(textFilePath)) {
        fs.unlinkSync(textFilePath);
    }

    // Read and parse the uploaded PDF
    fs.readFile(pdfFilePath, (err, dataBuffer) => {
        if (err) {
            console.error('Error reading the PDF file:', err);
            return res.status(500).send('Error processing the PDF');
        }

        pdf(dataBuffer)
            .then((data) => {
                fs.writeFile(textFilePath, data.text, (error) => {
                    if (error) {
                        console.error("Error writing document.txt: ", error);
                        return res.status(500).send('Error processing the PDF');
                    }

                    // Continue with summarization
                    summarizePDF(pdfFilePath, res);
                });
            })
            .catch((error) => {
                console.error('Error parsing the PDF:', error);
                res.status(500).send('Error processing the PDF');
            });
    });
};

function summarizePDF(pdfFilePath, res) {
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
            console.error('Error occurred while summarizing PDF:', errorOutput);
            return res.status(500).send('Error occurred while summarizing PDF');
        }

        try {
            const parsedSummary = JSON.parse(summary);
            res.status(200).json({
                summary: parsedSummary.summary,
                filename: 'uploaded_pdf.pdf' 
            });
        } catch (error) {
            console.error('Error parsing summary:', error);
            res.status(500).send('Error parsing summary');
        }
    });
}

module.exports = {
    summarizerRender,
    summarizer,
    upload
};
