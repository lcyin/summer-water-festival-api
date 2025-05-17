const qr = require("qr-image");

export const generateQRCode = (qrCode) => {
  const qrImage = qr.imageSync(qrCode, { type: "png" });
  return qrImage;
};
