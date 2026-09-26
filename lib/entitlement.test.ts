import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getPackPath } from "./packs.ts";
import { getLiveProduct, getProduct, PRODUCTS } from "./products.ts";

describe("catalog", () => {
  it("exposes five live SKUs with official Stripe price IDs", () => {
    const live = [
      ["outbound-ops-kit", "price_1UJlu44v69r4DPC8TWmMaWwK", "outbound-ops-kit.zip"],
      ["gbp-post-pack", "price_1UJltG4v69r4DPC8dwKEfa3I", "gbp-post-pack.zip"],
      ["missed-call-recovery", "price_1UJlwd4v69r4DPC8Ao7fsixe", "missed-call-recovery-pack.zip"],
      ["ads-swipe-pack", "price_1UJlwf4v69r4DPC8JZu7mVWh", "ads-swipe-pack.zip"],
      ["notion-crm-lite", "price_1UJweHGum6mar7mKS7M4BocS", "notion-crm-lite.zip"],
    ] as const;
    for (const [sku, priceId, packFile] of live) {
      const product = getLiveProduct(sku);
      assert.equal(product?.stripePriceId, priceId);
      assert.equal(product?.packFile, packFile);
      assert.equal(existsSync(getPackPath(packFile)), true);
    }
    assert.equal(getProduct("notion-crm-lite")?.stripePriceEnv, "STRIPE_PRICE_NOTION_CRM_LITE");
  });

  it("keeps coming-soon SKUs off the live checkout path", () => {
    const soon = ["landing-page-pack"];
    for (const sku of soon) {
      assert.equal(getProduct(sku)?.status, "coming-soon");
      assert.equal(getLiveProduct(sku), undefined);
    }
    assert.equal(getLiveProduct("ads-swipe"), undefined);
    assert.equal(PRODUCTS.filter((product) => product.status === "live").length, 5);
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
