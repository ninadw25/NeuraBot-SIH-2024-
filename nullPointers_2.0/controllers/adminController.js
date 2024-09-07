const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

const uploadAd = multer({ storage: storage });

// PDF upload handler
const pdfUploader = (req, res) => {
    const textFilePath = path.join(__dirname, '../assets/documents/policy.pdf');

    // Delete previous document.txt file if it exists
    if (fs.existsSync(textFilePath)) {
        fs.unlinkSync(textFilePath);
    }

    // Send response back to client after upload
    res.status(200).send('PDF uploaded successfully!');
};

module.exports = {
    adminLogin,
    adminHome,
    renderAdmin,
    pdfUploader,
    uploadAd
};