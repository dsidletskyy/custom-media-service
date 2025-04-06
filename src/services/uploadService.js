const multer = require('multer');

class UploadService {
    constructor() {
        this.upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: this.fileFilter
        });
    }

    fileFilter = (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }

    handleUpload = (req) => {
        return new Promise((resolve, reject) => {
            this.upload.single('file')(req, null, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(req.file);
                }
            });
        });
    }
}

module.exports = UploadService; 