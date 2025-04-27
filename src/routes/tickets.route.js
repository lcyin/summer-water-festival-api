import express from 'express';
import { fetchAvaliableTickets } from '../services/tickets.service.js';

const router = express.Router();

// GET /api/tickets/availability
router.get('/availability', fetchAvaliableTickets);

export default router;