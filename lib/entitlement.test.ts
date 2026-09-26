import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getLiveProduct, getProduct, PRODUCTS } from "./products.ts";

describe("catalog", () => {
  it("exposes four live SKUs with official Stripe price IDs", () => {
    const live = [
      ["outbound-ops-kit", "price_1UJlu44v69r4DPC8TWmMaWwK", "outbound-ops-kit.zip"],
      ["gbp-post-pack", "price_1UJltG4v69r4DPC8dwKEfa3I", "gbp-post-pack.zip"],
      ["missed-call-recovery", "price_1UJlwd4v69r4DPC8Ao7fsixe", "missed-call-recovery-pack.zip"],
      ["ads-swipe-pack", "price_1UJlwf4v69r4DPC8JZu7mVWh", "ads-swipe-pack.zip"],
    ] as const;
    for (const [sku, priceId, packFile] of live) {
      const product = getLiveProduct(sku);
      assert.equal(product?.stripePriceId, priceId);
      assert.equal(product?.packFile, packFile);
    }
  });

  it("keeps coming-soon SKUs off the live checkout path", () => {
    const soon = ["notion-crm-lite", "landing-page-pack"];
    for (const sku of soon) {
      assert.equal(getProduct(sku)?.status, "coming-soon");
      assert.equal(getLiveProduct(sku), undefined);
    }
    assert.equal(getLiveProduct("ads-swipe"), undefined);
    assert.equal(PRODUCTS.filter((product) => product.status === "live").length, 4);
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
