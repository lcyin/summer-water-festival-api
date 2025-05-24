import express from "express";
import {
  fetchAvaliableTickets,
  purchaseTickets,
} from "../services/tickets.service.js";

const router = express.Router();

// GET /api/tickets/availability
router.get("/availability", async (req, res, next) => {
  try {
    const result = await fetchAvaliableTickets();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets/purchase
router.post("/purchase", async (req, res, next) => {
  try {
    const { ticketType, quantity, email } = req.body;
    const result = await purchaseTickets(ticketType, quantity, email);
    res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
