import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import Stripe from "stripe";
import {
  buildSaleNotifyPayload,
  handleStripeWebhook,
  notifySaleScoreboard,
  type SaleNotifyPayload,
} from "./sale-notify.ts";

const samplePayload: SaleNotifyPayload = {
  event: "checkout.session.completed",
  sku: "outbound-ops-kit",
  amount_total: 4900,
  currency: "usd",
  session_id: "cs_live_123",
  customer_email: "buyer@example.com",
};

function restoreEnv(name: string, previous: string | undefined): void {
  if (previous === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = previous;
}

function signedEvent(type: string, object: Record<string, unknown>, secret: string) {
  const payload = JSON.stringify({
    id: "evt_test_1",
    object: "event",
    type,
    data: { object },
  });
  return {
    payload,
    header: Stripe.webhooks.generateTestHeaderString({ payload, secret }),
  };
}

describe("buildSaleNotifyPayload", () => {
  it("uses metadata.sku and customer_details.email", () => {
    assert.deepEqual(
      buildSaleNotifyPayload({
        id: "cs_live_123",
        amount_total: 4900,
        currency: "USD",
        metadata: { sku: "outbound-ops-kit" },
        customer_details: { email: "buyer@example.com" },
      }),
      samplePayload,
    );
  });

  it("falls back to line item price metadata when session metadata is missing", () => {
    assert.deepEqual(
      buildSaleNotifyPayload({
        id: "cs_test_line",
        amount_total: 2700,
        currency: "usd",
        customer_email: "line@example.com",
        line_items: {
          data: [{ price: { metadata: { sku: "gbp-post-pack" } } }],
        },
      }),
      {
        event: "checkout.session.completed",
        sku: "gbp-post-pack",
        amount_total: 2700,
        currency: "usd",
        session_id: "cs_test_line",
        customer_email: "line@example.com",
      },
    );
  });

  it("omits customer_email when Stripe did not collect one", () => {
    assert.deepEqual(
      buildSaleNotifyPayload({
        id: "cs_anon",
        amount_total: 0,
        metadata: { sku: "ads-swipe-pack" },
      }),
      {
        event: "checkout.session.completed",
        sku: "ads-swipe-pack",
        amount_total: 0,
        currency: "usd",
        session_id: "cs_anon",
      },
    );
  });
});

describe("notifySaleScoreboard", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("skips notify when SALE_NOTIFY_WEBHOOK_URL is unset", async () => {
    const previous = process.env.SALE_NOTIFY_WEBHOOK_URL;
    delete process.env.SALE_NOTIFY_WEBHOOK_URL;
    try {
      assert.equal(await notifySaleScoreboard(samplePayload), "skipped");
    } finally {
      restoreEnv("SALE_NOTIFY_WEBHOOK_URL", previous);
    }
  });

  it("treats a non-OK notify response as failed without throwing", async () => {
    const previous = process.env.SALE_NOTIFY_WEBHOOK_URL;
    process.env.SALE_NOTIFY_WEBHOOK_URL = "https://scoreboard.test/hook";
    globalThis.fetch = (async () => new Response("nope", { status: 502 })) as typeof fetch;
    try {
      assert.equal(await notifySaleScoreboard(samplePayload), "failed");
    } finally {
      restoreEnv("SALE_NOTIFY_WEBHOOK_URL", previous);
    }
  });

  it("POSTs the placar JSON when the notify URL is set", async () => {
    const previousUrl = process.env.SALE_NOTIFY_WEBHOOK_URL;
    const previousAuth = process.env.SALE_NOTIFY_AUTHORIZATION;
    process.env.SALE_NOTIFY_WEBHOOK_URL = "https://scoreboard.test/hook";
    delete process.env.SALE_NOTIFY_AUTHORIZATION;
    let posted: { url: string; init?: RequestInit } | undefined;
    globalThis.fetch = (async (url, init) => {
      posted = { url: String(url), init };
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    try {
      assert.equal(await notifySaleScoreboard(samplePayload), "sent");
      assert.equal(posted?.url, "https://scoreboard.test/hook");
      const headers = posted?.init?.headers as Record<string, string>;
      assert.equal(headers["Content-Type"], "application/json");
      assert.equal(headers.Authorization, undefined);
      assert.deepEqual(JSON.parse(String(posted?.init?.body)), samplePayload);
    } finally {
      restoreEnv("SALE_NOTIFY_WEBHOOK_URL", previousUrl);
      restoreEnv("SALE_NOTIFY_AUTHORIZATION", previousAuth);
    }
  });

  it("adds Authorization when SALE_NOTIFY_AUTHORIZATION is set", async () => {
    const previousUrl = process.env.SALE_NOTIFY_WEBHOOK_URL;
    const previousAuth = process.env.SALE_NOTIFY_AUTHORIZATION;
    process.env.SALE_NOTIFY_WEBHOOK_URL = "https://scoreboard.test/hook";
    process.env.SALE_NOTIFY_AUTHORIZATION = "Bearer test-scoreboard-token";
    let posted: { url: string; init?: RequestInit } | undefined;
    globalThis.fetch = (async (url, init) => {
      posted = { url: String(url), init };
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    try {
      assert.equal(await notifySaleScoreboard(samplePayload), "sent");
      const headers = posted?.init?.headers as Record<string, string>;
      assert.equal(headers["Content-Type"], "application/json");
      assert.equal(headers.Authorization, "Bearer test-scoreboard-token");
    } finally {
      restoreEnv("SALE_NOTIFY_WEBHOOK_URL", previousUrl);
      restoreEnv("SALE_NOTIFY_AUTHORIZATION", previousAuth);
    }
  });
});

describe("handleStripeWebhook", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns 500 when the webhook secret is missing", async () => {
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const result = await handleStripeWebhook("{}", "t=1,v1=abc");
      assert.equal(result.status, 500);
      assert.equal(result.body.error, "STRIPE_WEBHOOK_SECRET is not set");
    } finally {
      restoreEnv("STRIPE_WEBHOOK_SECRET", previous);
    }
  });

  it("returns 400 when the stripe-signature header is missing", async () => {
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    try {
      const result = await handleStripeWebhook("{}", null);
      assert.equal(result.status, 400);
      assert.equal(result.body.error, "Missing stripe-signature header");
    } finally {
      restoreEnv("STRIPE_WEBHOOK_SECRET", previous);
    }
  });

  it("returns 400 when the Stripe signature is invalid", async () => {
    const previous = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    try {
      const result = await handleStripeWebhook("{}", "t=1,v1=deadbeef");
      assert.equal(result.status, 400);
      assert.match(result.body.error ?? "", /signature verification failed/i);
    } finally {
      restoreEnv("STRIPE_WEBHOOK_SECRET", previous);
    }
  });

  it("ignores non-checkout events with 200 after a valid signature", async () => {
    const secret = "whsec_test_secret";
    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const signed = signedEvent("charge.succeeded", { id: "ch_1" }, secret);
    try {
      const result = await handleStripeWebhook(signed.payload, signed.header);
      assert.deepEqual(result, {
        status: 200,
        body: { received: true, ignored: "charge.succeeded" },
      });
    } finally {
      restoreEnv("STRIPE_WEBHOOK_SECRET", previousSecret);
    }
  });

  it("returns 200 when notify is unset or the scoreboard POST fails", async () => {
    const secret = "whsec_test_secret";
    const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const previousNotify = process.env.SALE_NOTIFY_WEBHOOK_URL;
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const signed = signedEvent(
      "checkout.session.completed",
      {
        id: "cs_live_abc",
        amount_total: 4900,
        currency: "usd",
        metadata: { sku: "outbound-ops-kit" },
        customer_details: { email: "buyer@example.com" },
      },
      secret,
    );

    delete process.env.SALE_NOTIFY_WEBHOOK_URL;
    try {
      const skipped = await handleStripeWebhook(signed.payload, signed.header);
      assert.deepEqual(skipped, { status: 200, body: { received: true } });

      process.env.SALE_NOTIFY_WEBHOOK_URL = "https://scoreboard.test/hook";
      globalThis.fetch = (async () => {
        throw new Error("network down");
      }) as typeof fetch;
      const failed = await handleStripeWebhook(signed.payload, signed.header);
      assert.deepEqual(failed, { status: 200, body: { received: true } });
    } finally {
      restoreEnv("STRIPE_WEBHOOK_SECRET", previousSecret);
      restoreEnv("SALE_NOTIFY_WEBHOOK_URL", previousNotify);
    }
  });
});
