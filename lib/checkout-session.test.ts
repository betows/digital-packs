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

  it("keeps invoicebatch on /invoicebatch/success with the live $47 price", () => {
    const previous = process.env.STRIPE_PRICE_INVOICEBATCH;
    delete process.env.STRIPE_PRICE_INVOICEBATCH;
    try {
      const product = getLiveProduct("invoicebatch");
      assert.ok(product);
      assert.equal(getStripePriceId(product), "price_1UKjjXGum6mar7mK4xhHMieB");
      assert.equal(product.successPath, "/invoicebatch/success");
      assert.equal(product.pagePath, "/invoicebatch");
      assert.equal(
        `${"https://digital-packs.vercel.app"}${product.successPath}?session_id={CHECKOUT_SESSION_ID}`,
        "https://digital-packs.vercel.app/invoicebatch/success?session_id={CHECKOUT_SESSION_ID}",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.STRIPE_PRICE_INVOICEBATCH;
      } else {
        process.env.STRIPE_PRICE_INVOICEBATCH = previous;
      }
    }
  });
});
