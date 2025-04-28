import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/index.js';

describe('Tickets API', () => {
    beforeEach(async () => {
        console.log('beforeEach');
        console.log(pool.options);
        // Verify we're using the test database
        expect(process.env.DB_NAME).toBe('summer_water_festival_test');
        expect(process.env.NODE_ENV).toBe('test');
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/tickets/availability', () => {
        it('should return 200 and ticket availability data', async () => {
            const response = await request(app)
                .get('/api/tickets/availability')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual([
                {
                    "limit": 50,
                    "name": "VIP",
                    "sold": expect.any(String),
                },
                {
                    "limit": 150,
                    "name": "Normal",
                    "sold": expect.any(String),
                },
            ]);
        });
    });

    describe('POST /api/tickets/purchase', () => {
        it('should return 400 when missing required fields', async () => {
            const response = await request(app)
                .post('/api/tickets/purchase')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).toBe('Missing required fields: ticketType and quantity');
        });

        xit('should return 400 when quantity is invalid', async () => {
            const response = await request(app)
                .post('/api/tickets/purchase')
                .send({ ticketType: 'Normal', quantity: 0 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).toMatchInlineSnapshot('Quantity must be greater than 0');
        });

        xit('should return 400 when ticket type is invalid', async () => {
            const response = await request(app)
                .post('/api/tickets/purchase')
                .send({ ticketType: 'InvalidType', quantity: 1 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).toBe('Invalid ticket type: InvalidType');
        });

        it('should return 200 when tickets are available', async () => {
            const response = await request(app)
                .post('/api/tickets/purchase')
                .send({ ticketType: 'Normal', quantity: 1 })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.message).toBe('Tickets available for purchase');
        });

        xit('should return 400 when requesting more tickets than available', async () => {
            // First, create some tickets to reduce availability
            await pool.query(`
                INSERT INTO orders (first_name, last_name, email, total_amount, payment_status)
                VALUES ('Test', 'User', 'test@example.com', 100.00, 'completed');
            `);

            const orderId = (await pool.query('SELECT id FROM orders ORDER BY id DESC LIMIT 1')).rows[0].id;
            const ticketTypeId = (await pool.query("SELECT id FROM ticket_types WHERE name = 'Normal'")).rows[0].id;

            // Create 149 Normal tickets (leaving 1 available)
            for (let i = 0; i < 149; i++) {
                await pool.query(`
                    INSERT INTO tickets (order_id, ticket_type_id, qr_code)
                    VALUES ($1, $2, $3)
                `, [orderId, ticketTypeId, `test-qr-${i}`]);
            }

            const response = await request(app)
                .post('/api/tickets/purchase')
                .send({ ticketType: 'Normal', quantity: 2 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).toBe('Not enough Normal tickets available. Requested: 2, Available: 1');
        });
    });
}); 