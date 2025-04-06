const multer = require('multer');

/**
 * Service for handling file uploads
 * Uses multer to process multipart/form-data requests
 * 
 * @class UploadService
 */
class UploadService {
    /**
     * Creates a new UploadService instance
     * Configures multer with memory storage and a custom file filter
     */
    constructor() {
        this.upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: this.fileFilter
        });
    }

    /**
     * Filters uploaded files based on their MIME type
     * Allows only specific file types to be uploaded
     * 
     * @param {Object} req - HTTP request object
     * @param {Object} file - File object from multer
     * @param {string} file.mimetype - MIME type of the uploaded file
     * @param {Function} cb - Callback function
     * @returns {void}
     */
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

    /**
     * Processes a file upload request
     * 
     * @param {Object} req - HTTP request object
     * @returns {Promise<Object>} A promise that resolves to the uploaded file object
     * @throws {Error} If the upload fails or an invalid file is provided
     */
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