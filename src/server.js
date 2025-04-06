const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const S3Service = require('./services/s3Service');
const UploadService = require('./services/uploadService');
const MediaController = require('./controllers/mediaController');
const Router = require('./router');

// Initialize services
const s3Service = new S3Service({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME
});

const uploadService = new UploadService();

// Initialize controller
const mediaController = new MediaController(s3Service, uploadService);

// Initialize router
const router = new Router(mediaController);

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const urlPath = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Log incoming requests
    console.log(`${new Date().toISOString()} - ${req.method} ${urlPath}`);

    // Serve static files from public directory
    if (urlPath === '/' || urlPath === '/index.html') {
        const filePath = path.join(__dirname, '../public/index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
        return;
    }

    // Route API requests
    if (urlPath.startsWith('/api')) {
        await router.handle(req, res, urlPath);
        return;
    }

    // Handle 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 