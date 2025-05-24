import pool from "../db/index.js";
import { generateTicketPDF } from "./pdf.service.js";
import { sendTicketEmail } from "./mail.service.js";
const TICKET_TYPES = {
  NORMAL: "Normal",
  VIP: "VIP",
};

export const fetchAvaliableTickets = async () => {
  return pool.query(`
        SELECT tt.name, COUNT(t.id) AS sold,
               CASE tt.name 
                   WHEN 'Normal' THEN 150 
                   WHEN 'VIP' THEN 50 
               END AS limit
        FROM ticket_types tt
        LEFT JOIN tickets t ON t.ticket_type_id = tt.id
        GROUP BY tt.id, tt.name
    `);
};

export const checkTicketAvailability = async (ticketType, quantity) => {
  const result = await pool.query(
    `
              SELECT tt.name, COUNT(t.id) AS sold,
                     CASE tt.name 
                         WHEN 'Normal' THEN 150 
                         WHEN 'VIP' THEN 50 
                     END AS limit
              FROM ticket_types tt
              LEFT JOIN tickets t ON t.ticket_type_id = tt.id
              WHERE tt.name = $1
              GROUP BY tt.name
          `,
    [ticketType]
  );

  if (result.rows.length === 0) {
    throw new Error(`Invalid ticket type: ${ticketType}`);
  }

  const { sold, limit } = result.rows[0];
  const available = limit - parseInt(sold);

  if (available < quantity) {
    throw new Error(
      `Not enough ${ticketType} tickets available. Requested: ${quantity}, Available: ${available}`
    );
  }

  const ticketTypeResult = await pool.query(
    `
              SELECT id, price FROM ticket_types WHERE name = $1
          `,
    [ticketType]
  );

  return {
    available,
    limit,
    ticketType: ticketTypeResult.rows[0],
  };
};

const validateTicketPurchaseInput = (ticketType, quantity) => {
  if (!ticketType) {
    return "Missing required fields: ticketType";
  }

  if (!Object.values(TICKET_TYPES).includes(ticketType)) {
    return `Invalid ticket type: ${ticketType}`;
  }

  if (typeof quantity !== "number" || isNaN(quantity)) {
    return "Missing required fields: Quantity must be a valid number";
  }

  if (quantity <= 0) {
    return "Quantity must be greater than 0";
  }
  return {
    ticketType,
    quantity,
  };
};

const fetchInfoForPurchaseTickets = async (ticketTypeRaw, quantityRaw) => {
  const requestBodyOrError = validateTicketPurchaseInput(
    ticketTypeRaw,
    quantityRaw
  );

  if (typeof requestBodyOrError === "string") {
    throw new Error(requestBodyOrError);
  }
  const { ticketType: ticketTypeValidated, quantity: quantityValidated } =
    requestBodyOrError;
  // Check ticket availability
  const { available, limit, ticketType } = await checkTicketAvailability(
    ticketTypeValidated,
    quantityValidated
  );
  return {
    ticketTypeValidated,
    quantityValidated,
    available,
    limit,
    ticketType,
  };
};

export const purchaseTickets = async (ticketTypeRaw, quantityRaw, email) => {
  const { quantityValidated, ticketType } = await fetchInfoForPurchaseTickets(
    ticketTypeRaw,
    quantityRaw
  );

  const client = await pool.connect();

  return processTicketPurchaseTransaction(
    client,
    ticketType,
    quantityValidated,
    email
  );
};

const processTicketPurchaseTransaction = async (
  client,
  { id: ticketTypeId, price: ticketPrice },
  quantity,
  email
) => {
  // TODO: stripe integration for payment processing
  // Start a transaction
  const result = [];
  try {
    await client.query("BEGIN");

    // Create a temporary order (since we're skipping payment processing)
    const totalAmount = ticketPrice * quantity;
    const orderResult = await client.query(
      `INSERT INTO orders (first_name, last_name, email, total_amount, payment_status)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
      ["Temporary", "Order", "temp@example.com", totalAmount, "completed"]
    );
    const orderId = orderResult.rows[0].id;

    for (let index = 0; index < quantity; index++) {
      const insertQuery = `INSERT INTO tickets (order_id, ticket_type_id)
      VALUES ($1, $2)
      RETURNING id;`;
      const insertedTicket = await client.query(insertQuery, [
        orderId,
        ticketTypeId,
      ]);
      const updateQuery = `UPDATE tickets SET qr_code = $1 WHERE id = $2 RETURNING id, "qr_code";`;
      const qrCode = `${
        insertedTicket.rows[0].id
      }-${orderId}-${ticketTypeId}-${Date.now()}`;
      console.log("🚀 ~ qrCode:", qrCode);
      const updateTicket = await client.query(updateQuery, [
        qrCode,
        insertedTicket.rows[0].id,
      ]);
      result.push(...updateTicket.rows);
    }

    await client.query("COMMIT");
    const pdfPath = `tmp/order-${orderId}.pdf`;
    const pdf = await generateTicketPDF(
      orderId,
      result.map((ticket) => ticket.qr_code),
      pdfPath
    );
    // Wait 1 second between each ticket PDF generation and email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sendTicketEmail(email, orderId, pdfPath);
    return {
      message: "Tickets purchased successfully",
      orderId,
      ticketResults: result,
    };
  } catch (error) {
    console.log("🚀 ~ error:", error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const buildOrder = (orderId, ticketTypeId) => {
  const qrCode = `TEMP-${orderId}-${ticketTypeId}-${Date.now()}`;
  return {
    orderId,
    ticketTypeId,
    qrCode,
  };
};
