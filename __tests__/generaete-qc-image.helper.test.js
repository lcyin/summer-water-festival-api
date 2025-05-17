import { generateQRCode } from "../src/helpers/generaete-qc-image.helper";
describe("generateQRCode", () => {
  it("should generate a valid PNG buffer for a valid input string", () => {
    const input = "test-qr-code";
    const result = generateQRCode(input);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should throw an error when input is null", () => {
    expect(() => generateQRCode(null)).toThrow();
  });

  it("should throw an error when input is undefined", () => {
    expect(() => generateQRCode(undefined)).toThrow();
  });
});
