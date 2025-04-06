const multer = require('multer');
const uploadConfig = require('../config/upload.config.json');

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
     * Uses configuration from upload.config.json for limits and allowed types
     */
    constructor() {
        this.upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: this.fileFilter,
            limits: {
                fileSize: uploadConfig.maxFileSize,
                files: uploadConfig.maxFiles
            }
        });

        // Create flat array of allowed MIME types from config
        this.allowedMimeTypes = Object.values(uploadConfig.allowedTypes)
            .reduce((types, category) => [...types, ...Object.keys(category)], []);
    }

    /**
     * Filters uploaded files based on their MIME type
     * Allows only specific file types defined in upload.config.json
     * 
     * @param {Object} req - HTTP request object
     * @param {Object} file - File object from multer
     * @param {string} file.mimetype - MIME type of the uploaded file
     * @param {Function} cb - Callback function
     * @returns {void}
     */
    fileFilter = (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${this.getAllowedExtensions()}`));
        }
    }

    /**
     * Gets a formatted string of allowed file extensions
     * 
     * @returns {string} Comma-separated list of allowed file extensions
     */
    getAllowedExtensions() {
        return Object.values(uploadConfig.allowedTypes)
            .reduce((extensions, category) => [...extensions, ...Object.values(category)], [])
            .join(', ');
    }

    /**
     * Processes a file upload request
     * 
     * @param {Object} req - HTTP request object
     * @returns {Promise<Object>} A promise that resolves to the uploaded file object
     * @throws {Error} If the upload fails, file is too large, or invalid file is provided
     */
    handleUpload = (req) => {
        return new Promise((resolve, reject) => {
            this.upload.single('file')(req, null, (err) => {
                if (err) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        reject(new Error(`File size exceeds ${uploadConfig.maxFileSizeMB}MB limit`));
                    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                        reject(new Error('Multiple files not allowed'));
                    } else {
                        reject(err);
                    }
                } else if (!req.file) {
                    reject(new Error('No file uploaded'));
                } else {
                    resolve(req.file);
                }
            });
        });
    }
}

module.exports = UploadService; 