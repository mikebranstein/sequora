import { Router, Express } from 'express';

const router = Router();

export function setRoutes(app: Express) {
    // Define your API routes here
    router.get('/api/example', (req, res) => {
        res.json({ message: 'This is an example route' });
    });

    // Add more routes as needed

    app.use(router);
}