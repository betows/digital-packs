import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getPackPath } from "./packs.ts";
import { getLiveProduct, getProduct, getSkuForPaymentLinkId, getSkuForStripePriceId, getStripePriceId, PRODUCTS } from "./products.ts";

describe("catalog", () => {
  it("exposes nine live SKUs with official Stripe price IDs", () => {
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

    const bundle = getLiveProduct("front-desk-bundle");
    assert.equal(bundle?.name, "Front Desk Bundle");
    assert.equal(bundle?.priceUsd, 79);
    assert.equal(bundle?.packFile, "front-desk-bundle.zip");
    assert.equal(bundle?.stripePriceEnv, "STRIPE_PRICE_FRONT_DESK_BUNDLE");
    assert.equal(bundle?.stripePriceId, "price_1UKMKiGum6mar7mKlPdMyGG3");
    assert.equal(bundle?.badge, "Best for front desk");
    assert.equal(existsSync(getPackPath("front-desk-bundle.zip")), true);

    const invoicebatch = getLiveProduct("invoicebatch");
    assert.equal(invoicebatch?.name, "InvoiceBatch");
    assert.equal(invoicebatch?.priceUsd, 47);
    assert.equal(invoicebatch?.packFile, "InvoiceBatch-v1.zip");
    assert.equal(invoicebatch?.stripePriceEnv, "STRIPE_PRICE_INVOICEBATCH");
    assert.equal(invoicebatch?.stripePriceId, "price_1UKjjXGum6mar7mK4xhHMieB");
    assert.equal(invoicebatch?.stripePaymentLinkId, "plink_1UKjjXGum6mar7mKBCp3Qycd");
    assert.equal(
      invoicebatch?.stripePaymentLinkUrl,
      "https://buy.stripe.com/3cI8wPews3n86RJa2B2wU00",
    );
    assert.equal(invoicebatch?.pagePath, "/invoicebatch");
    assert.equal(invoicebatch?.successPath, "/invoicebatch/success");
    assert.equal(existsSync(getPackPath("InvoiceBatch-v1.zip")), true);
    assert.equal(
      getSkuForPaymentLinkId("plink_1UKjjXGum6mar7mKBCp3Qycd"),
      "invoicebatch",
    );
    assert.equal(
      getSkuForStripePriceId("price_1UKjjXGum6mar7mK4xhHMieB"),
      "invoicebatch",
    );
    assert.equal(PRODUCTS.some((product) => /no-show/i.test(product.sku + product.name)), false);
  });

  it("reads invoicebatch checkout price from STRIPE_PRICE_INVOICEBATCH", () => {
    const product = getLiveProduct("invoicebatch");
    assert.ok(product);
    const previous = process.env.STRIPE_PRICE_INVOICEBATCH;
    process.env.STRIPE_PRICE_INVOICEBATCH = "price_test_invoicebatch";
    try {
      assert.equal(getStripePriceId(product), "price_test_invoicebatch");
    } finally {
      if (previous === undefined) {
        delete process.env.STRIPE_PRICE_INVOICEBATCH;
      } else {
        process.env.STRIPE_PRICE_INVOICEBATCH = previous;
      }
    }
  });

  it("reads front-desk-bundle checkout price from STRIPE_PRICE_FRONT_DESK_BUNDLE", () => {
    const product = getLiveProduct("front-desk-bundle");
    assert.ok(product);
    const previous = process.env.STRIPE_PRICE_FRONT_DESK_BUNDLE;
    process.env.STRIPE_PRICE_FRONT_DESK_BUNDLE = "price_test_front_desk";
    try {
      assert.equal(getStripePriceId(product), "price_test_front_desk");
    } finally {
      if (previous === undefined) {
        delete process.env.STRIPE_PRICE_FRONT_DESK_BUNDLE;
      } else {
        process.env.STRIPE_PRICE_FRONT_DESK_BUNDLE = previous;
      }
    }
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
    assert.equal(PRODUCTS.filter((product) => product.status === "live").length, 9);
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

  it("accepts a paid Payment Link session by price id or payment link id", () => {
    assert.equal(
      assertPaidSessionForSku(
        {
          payment_status: "paid",
          line_items: {
            data: [{ price: { id: "price_1UKjjXGum6mar7mK4xhHMieB" } }],
          },
        },
        "invoicebatch",
        { priceId: "price_1UKjjXGum6mar7mK4xhHMieB" },
      ).ok,
      true,
    );
    assert.equal(
      assertPaidSessionForSku(
        {
          payment_status: "paid",
          payment_link: "plink_1UKjjXGum6mar7mKBCp3Qycd",
        },
        "invoicebatch",
        { paymentLinkId: "plink_1UKjjXGum6mar7mKBCp3Qycd" },
      ).ok,
      true,
    );
    assert.equal(
      assertPaidSessionForSku(
        {
          payment_status: "paid",
          line_items: {
            data: [{ price: { id: "price_other" } }],
          },
        },
        "invoicebatch",
        { priceId: "price_1UKjjXGum6mar7mK4xhHMieB" },
      ).ok,
      false,
    );
  });
});
