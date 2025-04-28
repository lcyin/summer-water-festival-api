import pool from '../db/index.js';

export const fetchAvaliableTickets = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT tt.name, COUNT(t.id) AS sold,
                   CASE tt.name 
                       WHEN 'Normal' THEN 150 
                       WHEN 'VIP' THEN 50 
                   END AS limit
            FROM ticket_types tt
            LEFT JOIN tickets t ON t.ticket_type_id = tt.id
            GROUP BY tt.id, tt.name
        `);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

export const checkTicketAvailability = async (ticketType, quantity) => {
    try {
        const result = await pool.query(`
            SELECT tt.name, COUNT(t.id) AS sold,
                   CASE tt.name 
                       WHEN 'Normal' THEN 150 
                       WHEN 'VIP' THEN 50 
                   END AS limit
            FROM ticket_types tt
            LEFT JOIN tickets t ON t.ticket_type_id = tt.id
            WHERE tt.name = $1
            GROUP BY tt.name
        `, [ticketType]);

        if (result.rows.length === 0) {
            throw new Error(`Invalid ticket type: ${ticketType}`);
        }

        const { sold, limit } = result.rows[0];
        const available = limit - parseInt(sold);

        if (available < quantity) {
            throw new Error(`Not enough ${ticketType} tickets available. Requested: ${quantity}, Available: ${available}`);
        }

        return true;
    } catch (error) {
        throw error;
    }
}