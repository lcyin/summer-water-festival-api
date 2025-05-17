import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db/index.js";

describe("Tickets API", () => {
  beforeEach(async () => {
    console.log("beforeEach");
    console.log(pool.options);
    // Verify we're using the test database
    expect(process.env.DB_NAME).toBe("summer_water_festival_test");
    expect(process.env.NODE_ENV).toBe("test");

    // await pool.query("DELETE FROM orders");
    // await pool.query("DELETE FROM tickets");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /api/tickets/availability", () => {
    it("should return 200 and ticket availability data", async () => {
      const response = await request(app)
        .get("/api/tickets/availability")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toEqual([
        {
          limit: 50,
          name: "VIP",
          sold: expect.any(String),
        },
        {
          limit: 150,
          name: "Normal",
          sold: expect.any(String),
        },
      ]);
    });
  });

  describe("POST /api/tickets/purchase", () => {
    it("should return 400 when missing required fields", async () => {
      const response = await request(app)
        .post("/api/tickets/purchase")
        .send({})
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.error).toBe("Missing required fields: ticketType");
    });

    it("should return 400 when quantity is invalid", async () => {
      const response = await request(app)
        .post("/api/tickets/purchase")
        .send({ ticketType: "Normal", quantity: 0 })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.error).toEqual("Quantity must be greater than 0");
    });

    it("should return 400 when ticket type is invalid", async () => {
      const response = await request(app)
        .post("/api/tickets/purchase")
        .send({ ticketType: "InvalidType", quantity: 1 })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body.error).toBe("Invalid ticket type: InvalidType");
    });

    it("buy 2 tickerts, should return 200 when tickets are available", async () => {
      const response = await request(app)
        .post("/api/tickets/purchase")
        .send({ ticketType: "Normal", quantity: 2 });

      expect(response.body).toEqual({
        message: "Tickets purchased successfully",
        orderId: expect.any(Number),
        ticketResults: [
          {
            id: expect.any(Number),
            qr_code: expect.any(String),
          },
          {
            id: expect.any(Number),
            qr_code: expect.any(String),
          },
        ],
      });
    });
  });
});
