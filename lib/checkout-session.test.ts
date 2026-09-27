import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLiveProduct, getStripePriceId } from "./products.ts";
import { pickUtmParams, safeRelativePath, utmToMetadata } from "./utm.ts";

describe("checkout session contract", () => {
  it("keeps front-desk-bundle live with promo-ready UTM metadata", () => {
    const product = getLiveProduct("front-desk-bundle");
    assert.ok(product);
    assert.equal(getStripePriceId(product), "price_1UKMKiGum6mar7mKlPdMyGG3");

    const utm = pickUtmParams({
      utm_source: "reddit",
      utm_campaign: "sprint1003",
    });
    const metadata = { sku: product.sku, ...utmToMetadata(utm) };
    assert.deepEqual(metadata, {
      sku: "front-desk-bundle",
      utm_source: "reddit",
      utm_campaign: "sprint1003",
    });
    assert.equal(
      safeRelativePath("/free?utm_source=reddit"),
      "/free?utm_source=reddit",
    );
  });
});
