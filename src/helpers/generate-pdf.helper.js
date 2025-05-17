const PDFDocument = require("pdfkit");
const fs = require("fs");

export function generateTicketPDF(orderId, qrCodeImage, outputPath) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));
  doc.fontSize(20).text("Summer Water Festival", 100, 100);
  doc.fontSize(14).text(`Order ID: ${orderId}`, 100, 140);
  //   doc.fontSize(14).text(`QR Code: ${qrCode}`, 100, 160);
  // Add QR code image here (requires additional library like `qr-image`)
  doc.image(qrCodeImage, 100, 180, { width: 100 });
  doc.end();
  return doc;
}
