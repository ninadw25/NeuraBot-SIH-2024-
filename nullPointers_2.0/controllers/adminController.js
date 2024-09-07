const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs')
// Admin login controller
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

// Admin home page controller
const adminHome = (req, res) => {
    if (req.session.adminUsername && req.session.adminPassword) {
        res.render('adminHome');
    } else {
        res.redirect('/admin');
    }
};

// Render admin login page
const renderAdmin = (req, res) => {
    res.render('admin');
};

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, '../assets/documents/');
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'policy.pdf');
    }
});

const upload = multer({ storage: storage });

// PDF upload and ingestion handler
const pdfUploader = (req, res) => {
    const pdfFilePath = path.join(__dirname, '../assets/documents/policy.pdf');
    const textFilePath = path.join(__dirname, '../assets/documents/document.txt');

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
                    res.status(200).send('PDF uploaded and processed successfully!');
                });
            })
            .catch((error) => {
                console.error('Error parsing the PDF:', error);
                res.status(500).send('Error processing the PDF');
            });
    });
};

module.exports = {
    adminLogin,
    adminHome,
    renderAdmin,
    pdfUploader,
    upload
};
