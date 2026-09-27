import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getPackPath } from "./packs.ts";
import { getLiveProduct, getProduct, getStripePriceId, PRODUCTS } from "./products.ts";

describe("catalog", () => {
  it("exposes seven live SKUs with official Stripe price IDs", () => {
    const live = [
      ["outbound-ops-kit", "price_1UJlu44v69r4DPC8TWmMaWwK", "outbound-ops-kit.zip"],
      ["gbp-post-pack", "price_1UJltG4v69r4DPC8dwKEfa3I", "gbp-post-pack.zip"],
      ["missed-call-recovery", "price_1UJlwd4v69r4DPC8Ao7fsixe", "missed-call-recovery-pack.zip"],
      ["ads-swipe-pack", "price_1UJlwf4v69r4DPC8JZu7mVWh", "ads-swipe-pack.zip"],
      ["notion-crm-lite", "price_1UJweHGum6mar7mKS7M4BocS", "notion-crm-lite.zip"],
      ["landing-page-pack", "price_1UJwlfGum6mar7mKl69AgJHC", "landing-page-pack.zip"],
    ] as const;
    for (const [sku, priceId, packFile] of live) {
      const product = getLiveProduct(sku);
      assert.equal(product?.stripePriceId, priceId);
      assert.equal(product?.packFile, packFile);
      assert.equal(existsSync(getPackPath(packFile)), true);
    }
    assert.equal(getProduct("notion-crm-lite")?.stripePriceEnv, "STRIPE_PRICE_NOTION_CRM_LITE");
    assert.equal(getProduct("landing-page-pack")?.stripePriceEnv, "STRIPE_PRICE_LANDING_PAGE_PACK");

    const rocket = getLiveProduct("review-referral-rocket");
    assert.equal(rocket?.name, "Review & Referral Rocket Pack");
    assert.equal(rocket?.priceUsd, 29);
    assert.equal(rocket?.packFile, "review-referral-rocket.zip");
    assert.equal(rocket?.stripePriceEnv, "STRIPE_PRICE_REVIEW_REFERRAL_ROCKET");
    assert.equal(rocket?.stripePriceId, undefined);
    assert.equal(existsSync(getPackPath("review-referral-rocket.zip")), true);
  });

  it("reads review-referral-rocket checkout price from STRIPE_PRICE_REVIEW_REFERRAL_ROCKET", () => {
    const product = getLiveProduct("review-referral-rocket");
    assert.ok(product);
    const previous = process.env.STRIPE_PRICE_REVIEW_REFERRAL_ROCKET;
    process.env.STRIPE_PRICE_REVIEW_REFERRAL_ROCKET = "price_test_env_only";
    try {
      assert.equal(getStripePriceId(product), "price_test_env_only");
    } finally {
      if (previous === undefined) {
        delete process.env.STRIPE_PRICE_REVIEW_REFERRAL_ROCKET;
      } else {
        process.env.STRIPE_PRICE_REVIEW_REFERRAL_ROCKET = previous;
      }
    }
  });

  it("keeps unknown SKUs off the live checkout path", () => {
    assert.equal(getLiveProduct("ads-swipe"), undefined);
    assert.equal(getLiveProduct("coming-soon"), undefined);
    assert.equal(PRODUCTS.filter((product) => product.status === "live").length, 7);
    assert.equal(PRODUCTS.filter((product) => product.status === "coming-soon").length, 0);
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
