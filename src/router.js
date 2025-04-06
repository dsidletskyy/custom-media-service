const { handleUpload, handleGet, handleUpdate, handleDelete } = require('./s3Service');

const routes = {
    '/api/media': {
        POST: handleUpload,
        GET: handleGet
    },
    '/api/media/update': {
        PUT: handleUpdate
    },
    '/api/media/delete': {
        DELETE: handleDelete
    }
};

function router(req, res, path) {
    const route = routes[path];
    
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

    handler(req, res);
}

module.exports = { router }; 