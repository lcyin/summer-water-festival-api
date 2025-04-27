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