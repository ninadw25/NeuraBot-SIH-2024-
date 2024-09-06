const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: path.join(__dirname, "../uploads/"),
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;