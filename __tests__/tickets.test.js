import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/index.js';

describe('Tickets API', () => {
    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/tickets/availability', () => {
        it('should return 200 and ticket availability data', async () => {
            const response = await request(app)
                .get('/api/tickets/availability')
                .expect('Content-Type', /json/)
                .expect(200);

            // Add more specific assertions based on your expected response structure
            expect(response.body).toEqual(
                [
                    {
                        "limit": 50,
                        "name": "VIP",
                        "sold": "0",
                    },
                    {
                        "limit": 150,
                        "name": "Normal",
                        "sold": "0",
                    },
                ]
            );
        });
    });
}); 