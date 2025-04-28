import express from 'express';
import { fetchAvaliableTickets, checkTicketAvailability } from '../services/tickets.service.js';

const router = express.Router();

// GET /api/tickets/availability
router.get('/availability', fetchAvaliableTickets);

// POST /api/tickets/purchase
router.post('/purchase', async (req, res, next) => {
    try {
        const { ticketType, quantity } = req.body;

        if (!ticketType || !quantity) {
            return res.status(400).json({ error: 'Missing required fields: ticketType and quantity' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        // Check ticket availability
        await checkTicketAvailability(ticketType, quantity);

        // TODO: Add payment processing and ticket creation logic here
        res.status(200).json({ message: 'Tickets available for purchase' });
    } catch (error) {
        if (error.message.includes('Not enough')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

export default router;