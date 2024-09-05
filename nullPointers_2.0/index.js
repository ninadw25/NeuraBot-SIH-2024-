const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const multer = require('multer'); // For handling file uploads
const { logReqRes } = require('./middlewares/log');
const routes = require('./routes'); // Assuming you have additional routes
const mongoose = require('mongoose');

const staticRouter = require('./routes/index');
const userRouter = require('./routes/users')

const app = express();
const PORT = 3000;

// MongoDB Connection
const uri = "mongodb+srv://Suhas:XK5z55hBUJqahszP@null-pointers.vdsmm.mongodb.net/?retryWrites=true&w=majority";

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Mongoose connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

run();

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));
app.use(express.static('./assets'));
app.use(express.static('./scripts'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logReqRes("log.txt"));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Destination folder for uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file name
  }
});

const upload = multer({ storage: storage });

// Route to handle PDF upload and summarization
app.post('/summarize', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  try {
    // Call your Python summarization script here (or another function)
    const result = await runPythonSummarizer(filePath);

    res.json({ summary: result });
  } catch (error) {
    console.error('Error summarizing PDF:', error);
    res.status(500).json({ error: 'Failed to summarize the PDF.' });
  }
});

app.get('/summarize',(req,res) =>{
  res.render('summarizer.ejs')
})

// Function to run Python summarization script
async function runPythonSummarizer(filePath) {
  const { exec } = require('child_process');
  const command = `python -u ./apps/app.py ${filePath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(stderr);
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result.summary);
        } catch (parseError) {
          console.error('Error parsing Python script output:', parseError);
          reject('Failed to parse summarization result.');
        }
      }
    });
  });
}

app.use('/', routes);
// Routes
app.use('/', staticRouter);
app.use('/user', userRouter);

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error connecting with server", error);
  } else {
    console.log(`Server is listening on port -> ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  }
});
