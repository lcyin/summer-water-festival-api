import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import ticketsRouter from './routes/tickets.route.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests
    })
);

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/tickets', ticketsRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default app;