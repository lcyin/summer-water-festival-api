const fs = require("fs");
const path = require("path");
import { generateQRCode } from "../src/helpers/generaete-qc-image.helper";
import { generateTicketPDF } from "../src/helpers/generate-pdf.helper";

// filepath: src/helpers/generate-pdf.helper.test.js

describe("generateTicketPDF", () => {
  const tempDir = path.join(__dirname, "temp");
  const outputPath = path.join(tempDir, "test-ticket.pdf");

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  });

  afterAll(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  });

  it("should generate a PDF file successfully with valid inputs", () => {
    const orderId = "12345";
    const qrCode = "test-qr-code";
    try {
      generateTicketPDF(orderId, generateQRCode(qrCode), outputPath);
    } catch (error) {
      console.log("🚀 ~ it ~ error:", error);
    }

    expect(fs.existsSync(outputPath)).toBe(true);
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });

  it("should throw an error when outputPath is missing", () => {
    const orderId = "12345";
    const qrCode = "test-qr-code";

    expect(() => generateTicketPDF(orderId, qrCode)).toThrow();
  });

  it("should throw an error when orderId is missing", () => {
    const qrCode = "test-qr-code";

    expect(() => generateTicketPDF(undefined, qrCode, outputPath)).toThrow();
  });

  it("should throw an error when qrCode is missing", () => {
    const orderId = "12345";

    expect(() => generateTicketPDF(orderId, undefined, outputPath)).toThrow();
  });
});
