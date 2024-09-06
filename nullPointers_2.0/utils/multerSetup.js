const multer = require('multer');
const path = require('path');

// Define storage options for multer
const storage = multer.diskStorage({
    // Set the destination folder for uploaded files
    destination: (req, file, cb) => {
        cb(null, './uploads');  // Save files in the 'uploads' directory
    },
    // Set the filename for the uploaded files
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);  // Get the file extension
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);  // Set unique filename
    }
});

// File filter to ensure only PDFs are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);  // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed!'), false);  // Reject non-PDF files
    }
};

// Set up multer with the defined storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // Limit file size to 10 MB
    }
});

module.exports = upload;