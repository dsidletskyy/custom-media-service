class Router {
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