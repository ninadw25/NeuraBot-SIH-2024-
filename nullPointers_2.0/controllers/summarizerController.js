const { getGroqChatCompletion } = require('../utils/api');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const dirPath = path.join(__dirname, '../uploads/');
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'uploaded_pdf.pdf');
    }
});

const upload = multer({ storage: storage });

const renderSummarizer = (req, res) => {
    res.render('summarizer');
};

const uploadAndSummarize = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const fileBuffer = await fs.readFile(req.file.path);

        const data = await pdf(fileBuffer);
        const extractedText = data.text;

        const txtFilePath = path.join(__dirname, '../uploads', 'converted_text.txt');

        await fs.writeFile(txtFilePath, extractedText, 'utf8');

        const fileContent = await fs.readFile(txtFilePath, 'utf8');

        const prompt = `Summarize the following PDF content:\n\n${fileContent}`;

        const completion = await getGroqChatCompletion(prompt);
        const summary = completion.choices[0]?.message?.content || 'Failed to generate summary';

        res.json({ summary, filename: 'converted_text.txt' });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Error processing PDF' });
    }
};

const handleChat = async (req, res) => {
    const { message, pdfSummary } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        const prompt = `Based on the following context, answer the question no answering outside the context at all.:\n${pdfSummary}\n\nQuestion: ${message}, no cuss words, if cuss words are sent by user say please be appropriate`;
        const completion = await getGroqChatCompletion(prompt);
        const response = completion.choices[0]?.message?.content || 'Failed to generate response';

        res.json({ response });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Error processing chat message' });
    }
};

const deleteFile = async (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join('uploads', filename);

    try {
        await fs.unlink(filepath);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
};

module.exports = {
    renderSummarizer,
    uploadAndSummarize,
    handleChat,
    deleteFile,
    upload
};