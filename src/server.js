/**
 * Main server file for the custom media service
 * Sets up HTTP server, services, controllers, and routing
 * 
 * @module server
 */

const http = require('http');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const S3Service = require('./services/s3Service');
const UploadService = require('./services/uploadService');
const MediaController = require('./controllers/mediaController');
const Router = require('./router');
const LoggerService = require('./services/loggerService');

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

/**
 * Creates and configures the HTTP server
 * Handles incoming requests, CORS, and routing
 */
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
    LoggerService.debug('Incoming request', {
        method: req.method,
        path: urlPath,
    });

    // Serve static files from public directory
    if (urlPath === '/' || urlPath === '/index.html') {
        const filePath = path.join(__dirname, '../public/index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                LoggerService.error('Error loading index.html', err);
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            LoggerService.debug('Serving index.html');
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
    LoggerService.debug('Route not found', { path: urlPath });
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

// Error handling for server
server.on('error', (error) => {
    LoggerService.error('Server error occurred', error);
});

/**
 * Starts the server on the specified port
 * Logs server startup information
 */
server.listen(PORT, () => {
    LoggerService.info('Server started', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
}); 