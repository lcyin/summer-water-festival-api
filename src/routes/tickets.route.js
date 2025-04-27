const express = require('express');
const pool = require('../db');
const { fetchAvaliableTickets } = require('../services/tickets.service')

const router = express.Router();

// GET /api/tickets/availability
router.get('/availability', fetchAvaliableTickets);

module.exports = router;