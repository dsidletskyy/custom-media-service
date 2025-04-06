/**
 * Router class for handling HTTP requests.
 * Maps URLs and HTTP methods to controller methods.
 * Provides centralized request routing and error handling.
 * 
 * @class Router
 */
class Router {
    /**
     * Creates a new Router instance.
     * Initializes routes mapping for media operations.
     * 
     * @param {Object} mediaController - Controller for handling media operations
     */
    constructor(mediaController) {
        this.mediaController = mediaController;
        this.routes = {
            '/api/media': {
                POST: this.mediaController.handleUpload,
                GET: this.mediaController.handleGet
            },
            '/api/media/update': {
                PUT: this.mediaController.handleUpdate
            },
            '/api/media/delete': {
                DELETE: this.mediaController.handleDelete
            }
        };
    }

    /**
     * Handles an incoming HTTP request.
     * Routes the request to the appropriate controller method based on path and HTTP method.
     * Provides error responses for invalid routes and methods.
     * 
     * @param {Object} req - HTTP request object
     * @param {Object} res - HTTP response object
     * @param {string} path - Request path
     * @returns {Promise<void>}
     */
    async handle(req, res, path) {
        const route = this.routes[path];
        
        if (!route) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
            return;
        }

        const handler = route[req.method];
        
        if (!handler) {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
        }

        await handler(req, res);
    }
}

module.exports = Router; 