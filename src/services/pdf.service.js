import PDFDocument from "pdfkit";
import fs from "fs";
import qr from "qr-image";

export const generateTicketPDF = async (orderId, qrCode, outputPath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));
  doc.fontSize(20).text("Summer Water Festival", 100, 100);
  doc.fontSize(14).text(`Order ID: ${orderId}`, 100, 140);
  doc.fontSize(14).text(`QR Code: ${qrCode}`, 100, 160);
  const qrImage = qr.imageSync(qrCode, { type: "png" });
  doc.image(qrImage, 100, 180, { width: 100 });
  doc.end();
  return doc;
};
