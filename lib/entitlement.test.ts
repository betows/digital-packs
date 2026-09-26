import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getLiveProduct, getProduct, PRODUCTS } from "./products.ts";

describe("catalog", () => {
  it("exposes two live SKUs with official Stripe price IDs", () => {
    const outbound = getLiveProduct("outbound-ops-kit");
    const gbp = getLiveProduct("gbp-post-pack");
    assert.equal(outbound?.stripePriceId, "price_1UJlu44v69r4DPC8TWmMaWwK");
    assert.equal(gbp?.stripePriceId, "price_1UJltG4v69r4DPC8dwKEfa3I");
    assert.equal(outbound?.packFile, "outbound-ops-kit.zip");
    assert.equal(gbp?.packFile, "gbp-post-pack.zip");
  });

  it("keeps coming-soon SKUs off the live checkout path", () => {
    const soon = [
      "missed-call-recovery",
      "ads-swipe",
      "notion-crm-lite",
      "landing-page-pack",
    ];
    for (const sku of soon) {
      assert.equal(getProduct(sku)?.status, "coming-soon");
      assert.equal(getLiveProduct(sku), undefined);
    }
    assert.equal(PRODUCTS.filter((product) => product.status === "live").length, 2);
  });
});

describe("entitlement", () => {
  it("requires a paid session whose metadata sku matches", () => {
    assert.equal(
      assertPaidSessionForSku(
        { payment_status: "paid", metadata: { sku: "outbound-ops-kit" } },
        "outbound-ops-kit",
      ).ok,
      true,
    );
    assert.equal(
      assertPaidSessionForSku(
        { payment_status: "unpaid", metadata: { sku: "outbound-ops-kit" } },
        "outbound-ops-kit",
      ).ok,
      false,
    );
    assert.equal(
      assertPaidSessionForSku(
        { payment_status: "paid", metadata: { sku: "gbp-post-pack" } },
        "outbound-ops-kit",
      ).ok,
      false,
    );
  });
});
