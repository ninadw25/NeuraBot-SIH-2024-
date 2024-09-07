const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');

const adminLogin = (req, res) => {
    const { username, password } = req.body;

    if (username === "nullPointers" && password === "123456") {
        req.session.adminUsername = username;
        req.session.adminPassword = password;
        res.redirect('/admin/home');
    } else {
        res.redirect('/admin');
    }
};

const adminHome = (req, res) => {
    if (req.session.adminUsername && req.session.adminPassword) {
        res.render('adminHome');
    } else {
        res.redirect('/admin');
    }
};

const renderAdmin = (req, res) => {
    res.render('admin');
};

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, '../assets/documents/');
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'policy.pdf');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const pdfUploader = (req, res) => {
    if (!req.file) {7
        return res.status(400).send('No file uploaded or invalid file type.');
    }

    // const textFilePath = path.join(__dirname, '../assets/documents/document.txt');

    // Delete previous document.txt file if it exists
    // if (fs.existsSync(textFilePath)) {
    //     fs.unlinkSync(textFilePath);
    // }

    // Trigger the ingest.js script to process the uploaded PDF
    exec('node scripts/ingest.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error executing ingest.js: ${err}`);
            return res.status(500).send('Error processing the PDF.');
        }

        console.log('Ingest script output:', stdout);
        res.send('PDF uploaded and processed successfully.');
    });
};

module.exports = {
    adminLogin,
    adminHome,
    renderAdmin,
    pdfUploader,
    upload
};