import PDFDocument from "pdfkit";
import fs from "fs";
import qr from "qr-image";

export const generateTicketPDF = async (orderId, qrCodes, outputPath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));
  doc.fontSize(20).text("Summer Water Festival", 100, 100);
  doc.fontSize(14).text(`Order ID: ${orderId}`, 100, 140);

  let y = 160;
  qrCodes.forEach((qrCode, idx) => {
    doc.fontSize(14).text(`Ticket ${idx + 1}`, 100, y);
    y += 20;
    doc.fontSize(14).text(`QR Code ${idx + 1}: ${qrCode}`, 100, y);
    y += 20;
    const qrImage = qr.imageSync(qrCode, { type: "png" });
    doc.image(qrImage, 100, y, { width: 100 });
    y += 120;
  });

  doc.end();
  return doc;
};
