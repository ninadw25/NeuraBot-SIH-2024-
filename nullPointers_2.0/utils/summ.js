const { exec } = require('child_process');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/summarize', (req, res) => {
  const { filePath } = req.body;  // Expecting the PDF file path from the frontend

  exec(`python3 ${path.join(__dirname, '../apps/app.py')} "${filePath}"`  , (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      res.status(500).json({ error: 'An error occurred while summarizing the PDF.' });
      return;
    }
  
    try {
      const result = JSON.parse(stdout);  // Expecting valid JSON output from Python
      res.json(result);
    } catch (err) {
      console.error('Error parsing Python script output:', err);
      res.status(500).json({ error: 'Failed to parse summarization result.' });
    }
  });
  
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});