const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ticketsRouter = require('./routes/tickets.route');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});