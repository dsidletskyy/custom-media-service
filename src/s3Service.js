const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Log configuration on startup
console.log('S3 Configuration:');
console.log('Region:', process.env.AWS_REGION);
console.log('Bucket:', BUCKET_NAME);

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Helper function to handle multer upload
function handleMulterUpload(req) {
    return new Promise((resolve, reject) => {
        upload.single('file')(req, null, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(req.file);
            }
        });
    });
}

async function handleUpload(req, res) {
    try {
        console.log('Starting file upload...');
        console.log('Bucket name:', BUCKET_NAME);
        
        const file = await handleMulterUpload(req);
        if (!file) {
            throw new Error('No file uploaded');
        }

        console.log('File received:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });

        const key = `uploads/${Date.now()}-${file.originalname}`;
        console.log('Uploading to S3:', {
            bucket: BUCKET_NAME,
            key: key
        });

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await s3Client.send(command);
        console.log('Upload successful');

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

async function handleGet(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filename = url.searchParams.get('filename');

        if (!filename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Filename is required' }));
            return;
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `uploads/${filename}`
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: signedUrl }));
    } catch (error) {
        console.error('Get error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to get file' }));
    }
}

async function handleUpdate(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const oldFilename = url.searchParams.get('filename');

        if (!oldFilename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Old filename is required' }));
            return;
        }

        const file = await handleMulterUpload(req);
        if (!file) {
            throw new Error('No file uploaded');
        }

        // Delete old file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `uploads/${oldFilename}`
        });
        await s3Client.send(deleteCommand);

        // Upload new file
        const key = `uploads/${Date.now()}-${file.originalname}`;
        const putCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });
        await s3Client.send(putCommand);

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

async function handleDelete(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filename = url.searchParams.get('filename');

        if (!filename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Filename is required' }));
            return;
        }

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `uploads/${filename}`
        });

        await s3Client.send(command);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File deleted successfully' }));
    } catch (error) {
        console.error('Delete error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Delete failed' }));
    }
}

module.exports = {
    handleUpload,
    handleGet,
    handleUpdate,
    handleDelete
}; 