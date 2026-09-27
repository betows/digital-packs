import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { startCheckout } from "./fulfillment.ts";

describe("startCheckout", () => {
  it("enables promo codes and stores UTM metadata on the session", async () => {
    let created: Record<string, unknown> | undefined;
    const stripe = {
      checkout: {
        sessions: {
          create: async (params: Record<string, unknown>) => {
            created = params;
            return { id: "cs_test", url: "https://checkout.stripe.com/test" };
          },
          retrieve: async () => {
            throw new Error("unused");
          },
        },
      },
    };

    const result = await startCheckout(
      stripe,
      "front-desk-bundle",
      "https://digital-packs.vercel.app",
      {
        utm: { utm_source: "reddit", utm_campaign: "sprint1003" },
        cancelPath: "/free?utm_source=reddit&utm_campaign=sprint1003",
      },
    );

    assert.equal(result.ok, true);
    assert.equal(created?.allow_promotion_codes, true);
    assert.deepEqual(created?.metadata, {
      sku: "front-desk-bundle",
      utm_source: "reddit",
      utm_campaign: "sprint1003",
    });
    assert.equal(
      created?.cancel_url,
      "https://digital-packs.vercel.app/free?utm_source=reddit&utm_campaign=sprint1003",
    );
    const lineItems = created?.line_items as Array<{ price: string }>;
    assert.equal(lineItems[0]?.price, "price_1UKMKiGum6mar7mKlPdMyGG3");
  });
});
