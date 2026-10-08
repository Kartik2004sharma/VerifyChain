import { describe, it, expect } from "vitest";
import {
  inspectMetadata,
  canonicalMetadata,
  metadataHash,
  metadataSchema,
  productIdSchema,
  parseQR,
  csvCell,
} from "@/lib/domain/metadata";
import { verdict } from "@/lib/domain/passport";
const m = {
  schema: "verifychain.product.v1",
  productId: "VC-01",
  name: "Coffee",
  description: "Traceable beans",
  category: "Food",
  serial: "01",
  origin: "India",
};
describe("Canonical metadata R01 V05 V09", () => {
  it("has stable order and a cryptographic commitment", () => {
    expect(canonicalMetadata({ ...m, origin: m.origin })).toBe(
      canonicalMetadata({ ...m }),
    );
    expect(metadataHash(m)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(metadataHash({ ...m, name: "Altered" })).not.toBe(metadataHash(m));
  });
  it("rejects unknown fields and schema", () => {
    expect(
      metadataSchema.safeParse({ ...m, signatureValid: true }).success,
    ).toBe(false);
    expect(metadataSchema.safeParse({ ...m, schema: "v0" }).success).toBe(
      false,
    );
  });
  it.each(["", " ", "😀".repeat(26), "a".repeat(101), "x\u0000y"])(
    "rejects invalid ID %s",
    (id) => expect(productIdSchema.safeParse(id).success).toBe(false),
  );
  it("counts UTF-8 bytes and trims", () => {
    expect(productIdSchema.parse(" 界 ")).toBe("界");
    expect(productIdSchema.parse("a".repeat(100))).toHaveLength(100);
  });
});
describe("Independent verdicts V02 V05 V06", () => {
  it.each([
    [true, "match", "registered"],
    [true, "unavailable", "registered"],
    [true, "mismatch", "integrity_mismatch"],
    [false, "match", "revoked"],
    [false, "mismatch", "revoked"],
  ] as const)("classifies %s %s", (active, integrity, result) =>
    expect(verdict(active, integrity)).toBe(result),
  );
});
describe("QR trust Q01 Q03 and exports D03", () => {
  it("roundtrips Unicode and legacy links", () => {
    for (const route of ["/verify", "/dashboard/verify-product"])
      expect(
        parseQR(
          `https://verify.test${route}?id=${encodeURIComponent("界/01")}`,
          "https://verify.test",
        ),
      ).toBe("界/01");
  });
  it.each([
    "javascript:alert(1)",
    "https://evil.test/verify?id=a",
    "https://verify.test/other?id=a",
    "https://user:pass@verify.test/verify?id=a",
    "https://verify.test/verify",
  ])("rejects untrusted QR %s", (url) =>
    expect(() => parseQR(url, "https://verify.test")).toThrow(),
  );
  it("escapes CSV and neutralizes formulas", () => {
    expect(csvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"');
    expect(csvCell('a,b\n"c"')).toBe('"a,b\n""c"""');
  });
});

it("invalid or changed retrieved metadata is a mismatch, not a network outage", () => {
  expect(
    inspectMetadata({}, metadataHash(m), m.productId, m.name).integrity,
  ).toBe("mismatch");
  expect(
    inspectMetadata(m, metadataHash(m), m.productId, m.name).integrity,
  ).toBe("match");
  expect(
    inspectMetadata(
      { ...m, name: "Changed" },
      metadataHash(m),
      m.productId,
      m.name,
    ).integrity,
  ).toBe("mismatch");
});
