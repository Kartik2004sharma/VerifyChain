import { it, expect } from "vitest";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { qrLabel } from "@/lib/domain/metadata";
it("downloadable QR decodes to the exact Unicode passport URL Q04", async () => {
  const id = "VC-界/001";
  const url = `https://verify.test/verify?id=${encodeURIComponent(id)}`;
  const png = PNG.sync.read(
    await QRCode.toBuffer(url, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    }),
  );
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe(url);
  const svg = await QRCode.toString(url, { type: "svg", width: 280 });
  const label = qrLabel(svg, id);
  expect(label).toContain("Ethereum Sepolia testnet");
  expect(label).toContain(id);
  expect(label).toContain('viewBox="0 0 340 410"');
});
it("label text escapes untrusted markup", () =>
  expect(qrLabel('<svg width="280"></svg>', "<script>")).not.toContain(
    "<script>",
  ));
