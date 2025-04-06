class MediaController {
    constructor(s3Service, uploadService) {
        this.s3Service = s3Service;
        this.uploadService = uploadService;
    }

    handleUpload = async (req, res) => {
        try {
            const file = await this.uploadService.handleUpload(req);
            if (!file) {
                throw new Error('No file uploaded');
            }

            console.log('File received:', {
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            });

            const key = `uploads/${Date.now()}-${file.originalname}`;
            await this.s3Service.uploadFile(key, file.buffer, file.mimetype);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'File uploaded successfully',
                filename: file.originalname
            }));
        } catch (error) {
            console.error('Upload error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Upload failed',
                details: error.message
            }));
        }
    }

    handleGet = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filename = url.searchParams.get('filename');

            if (!filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Filename is required' }));
                return;
            }

            const key = `uploads/${filename}`;
            const signedUrl = await this.s3Service.getSignedUrl(key);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ url: signedUrl }));
        } catch (error) {
            console.error('Get error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to get file' }));
        }
    }

    handleUpdate = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const oldFilename = url.searchParams.get('filename');

            if (!oldFilename) {
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

            // Upload new file
            const newKey = `uploads/${Date.now()}-${file.originalname}`;
            await this.s3Service.uploadFile(newKey, file.buffer, file.mimetype);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                message: 'File updated successfully',
                filename: file.originalname
            }));
        } catch (error) {
            console.error('Update error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Update failed' }));
        }
    }

    handleDelete = async (req, res) => {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filename = url.searchParams.get('filename');

            if (!filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Filename is required' }));
                return;
            }

            const key = `uploads/${filename}`;
            await this.s3Service.deleteFile(key);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File deleted successfully' }));
        } catch (error) {
            console.error('Delete error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Delete failed' }));
        }
    }
}

module.exports = MediaController; 