const LoggerService = require('../services/loggerService');

/**
 * Controller class for handling media-related operations.
 * Manages file uploads, retrievals, updates, and deletions through S3 and upload services.
 * Provides a unified interface for all media operations.
 * 
 * @class MediaController
 */
class MediaController {
    /**
     * Creates a new MediaController instance.
     * Initializes S3 and upload service dependencies.
     * 
     * @param {Object} s3Service - Service for interacting with AWS S3
     * @param {Object} uploadService - Service for handling file uploads
     */
    constructor(s3Service, uploadService) {
        this.s3Service = s3Service;
        this.uploadService = uploadService;
    }

    /**
     * Handles file upload requests.
     * Processes the uploaded file, stores it in S3, and returns a success response.
     * Includes error handling and logging for the upload process.
     * 
     * @method
     * @param {Object} req - HTTP request object
     * @param {Object} res - HTTP response object
     * @returns {Promise<void>}
     * @throws {Error} If no file is uploaded or upload process fails
     */
    handleUpload = async (req, res) => {
        try {
            const file = await this.uploadService.handleUpload(req);
            if (!file) {
                throw new Error('No file uploaded');
            }

            LoggerService.info('File received', {
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });

            const key = `uploads/${Date.now()}-${file.originalname}`;
            await this.s3Service.uploadFile(key, file.buffer, file.mimetype);
            LoggerService.info('File uploaded successfully', { key });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'File uploaded successfully',
                filename: key.split('/').pop()
            }));
        } catch (error) {
            LoggerService.error('Upload failed', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Upload failed',
                details: error.message
            }));
        }
    }

    /**
     * Handles file retrieval requests.
     * Generates a signed URL for accessing a file from S3.
     * Validates filename parameter and handles errors.
     * 
     * @method
     * @param {Object} req - HTTP request object
     * @param {string} req.url - Request URL containing query parameters
     * @param {Object} req.headers - Request headers
     * @param {Object} res - HTTP response object
     * @returns {Promise<void>}
     * @throws {Error} If filename is not provided or retrieval fails
     */
    handleGet = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filename = url.searchParams.get('filename');

            if (!filename) {
                LoggerService.error('Filename not provided');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Filename is required' }));
                return;
            }

            const key = `uploads/${filename}`;
            const signedUrl = await this.s3Service.getSignedUrl(key);
            LoggerService.info('Generated signed URL', { key });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ url: signedUrl }));
        } catch (error) {
            LoggerService.error('Failed to get file', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to get file' }));
        }
    }

    /**
     * Handles file update requests.
     * Deletes the old file and uploads a new one with the same name.
     * Manages the entire update process including error handling.
     * 
     * @method
     * @param {Object} req - HTTP request object
     * @param {string} req.url - Request URL containing query parameters
     * @param {Object} req.headers - Request headers
     * @param {Object} res - HTTP response object
     * @returns {Promise<void>}
     * @throws {Error} If old filename is not provided or update process fails
     */
    handleUpdate = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const oldFilename = url.searchParams.get('filename');

            if (!oldFilename) {
                LoggerService.error('Old filename not provided');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Old filename is required' }));
                return;
            }

            const file = await this.uploadService.handleUpload(req);
            if (!file) {
                throw new Error('No file uploaded');
            }

            // Delete old file
            const oldKey = `uploads/${oldFilename}`;
            await this.s3Service.deleteFile(oldKey);
            LoggerService.info('Old file deleted', { key: oldKey });

            // Upload new file
            const newKey = `uploads/${Date.now()}-${file.originalname}`;
            await this.s3Service.uploadFile(newKey, file.buffer, file.mimetype);
            LoggerService.info('New file uploaded', { key: newKey });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'File updated successfully',
                filename: file.originalname
            }));
        } catch (error) {
            LoggerService.error('Update failed', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Update failed' }));
        }
    }

    /**
     * Handles file deletion requests.
     * Removes the specified file from S3.
     * Validates input and provides appropriate error responses.
     * 
     * @method
     * @param {Object} req - HTTP request object
     * @param {string} req.url - Request URL containing query parameters
     * @param {Object} req.headers - Request headers
     * @param {Object} res - HTTP response object
     * @returns {Promise<void>}
     * @throws {Error} If filename is not provided or deletion fails
     */
    handleDelete = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filename = url.searchParams.get('filename');

            if (!filename) {
                LoggerService.error('Filename not provided');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Filename is required' }));
                return;
            }

            const key = `uploads/${filename}`;
            await this.s3Service.deleteFile(key);
            LoggerService.info('File deleted', { key });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File deleted successfully' }));
        } catch (error) {
            LoggerService.error('Delete failed', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Delete failed' }));
        }
    }
}

module.exports = MediaController; 