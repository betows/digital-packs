import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  accessCookieOptions,
  findPaidInvoiceBatchSessionByEmail,
  handleInvoiceBatchAccessRequest,
  handleInvoiceBatchRestoreRequest,
  signAccessToken,
  verifyAccessToken,
  verifyPaidInvoiceBatchSession,
  type StripeAccessClient,
} from "./invoicebatch-access.ts";

const SECRET = "test-invoicebatch-access-secret";
const PRICE = "price_1UKjjXGum6mar7mK4xhHMieB";
const ORIGIN = "https://digital-packs.vercel.app";

function restoreEnv(name: string, previous: string | undefined): void {
  if (previous === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = previous;
}

function paidSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_paid_invoicebatch",
    object: "checkout.session",
    payment_status: "paid",
    customer_details: { email: "buyer@example.com" },
    metadata: { sku: "invoicebatch" },
    line_items: {
      data: [{ price: { id: PRICE } }],
    },
    ...overrides,
  };
}

function mockStripe(session: ReturnType<typeof paidSession> | null): StripeAccessClient {
  return {
    checkout: {
      sessions: {
        retrieve: async (id: string) => {
          if (!session || id !== session.id) {
            throw new Error("No such checkout.session");
          }
          return session;
        },
        list: async (params: { customer?: string; customer_details?: { email?: string } }) => {
          if (!session) return { data: [] };
          if (params.customer_details?.email) {
            const email = session.customer_details?.email;
            return {
              data: email === params.customer_details.email ? [session] : [],
            };
          }
          if (params.customer) {
            return { data: session.customer === params.customer ? [session] : [] };
          }
          return { data: [session] };
        },
        search: async () => ({ data: session ? [session] : [] }),
      },
    },
    customers: {
      list: async (params: { email?: string }) => {
        const email = session?.customer_details?.email;
        if (session && email && email === params.email) {
          return { data: [{ id: "cus_test", email }] };
        }
        return { data: [] };
      },
    },
  } as unknown as StripeAccessClient;
}

describe("invoicebatch access tokens", () => {
  it("mints httpOnly cookie options", () => {
    assert.equal(accessCookieOptions().httpOnly, true);
    assert.equal(accessCookieOptions().sameSite, "lax");
    assert.equal(accessCookieOptions().path, "/");
  });

  it("accepts a signed token and rejects a forged signature", () => {
    const token = signAccessToken({ sessionId: "cs_test_paid_invoicebatch", email: "buyer@example.com" }, SECRET);
    assert.equal(verifyAccessToken(token, SECRET)?.sid, "cs_test_paid_invoicebatch");
    const [body] = token.split(".");
    const forged = `${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    assert.equal(verifyAccessToken(forged, SECRET), null);
    assert.equal(verifyAccessToken(token, "other-secret"), null);
  });

  it("rejects expired tokens", () => {
    const token = signAccessToken(
      { sessionId: "cs_test_paid_invoicebatch", expiresInSeconds: -10 },
      SECRET,
    );
    assert.equal(verifyAccessToken(token, SECRET), null);
  });
});

describe("verifyPaidInvoiceBatchSession", () => {
  const previousSecret = process.env.INVOICEBATCH_ACCESS_SECRET;

  afterEach(() => {
    restoreEnv("INVOICEBATCH_ACCESS_SECRET", previousSecret);
  });

  it("grants access for a paid InvoiceBatch session", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const result = await verifyPaidInvoiceBatchSession(
      mockStripe(paidSession()),
      "cs_test_paid_invoicebatch",
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(verifyAccessToken(result.token, SECRET)?.sid, "cs_test_paid_invoicebatch");
    }
  });

  it("rejects unpaid sessions", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const result = await verifyPaidInvoiceBatchSession(
      mockStripe(paidSession({ payment_status: "unpaid" })),
      "cs_test_paid_invoicebatch",
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "unpaid");
  });

  it("rejects the wrong Stripe price", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const result = await verifyPaidInvoiceBatchSession(
      mockStripe(
        paidSession({
          metadata: {},
          line_items: { data: [{ price: { id: "price_other_sku" } }] },
        }),
      ),
      "cs_test_paid_invoicebatch",
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "wrong_sku");
  });
});

describe("handleInvoiceBatchAccessRequest", () => {
  const previousSecret = process.env.INVOICEBATCH_ACCESS_SECRET;

  afterEach(() => {
    restoreEnv("INVOICEBATCH_ACCESS_SECRET", previousSecret);
  });

  it("sets a signed token for a paid session and redirects to the app", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const request = new Request(
      `${ORIGIN}/api/invoicebatch/access?session_id=cs_test_paid_invoicebatch`,
      { headers: { host: "digital-packs.vercel.app", "x-forwarded-proto": "https" } },
    );
    const response = await handleInvoiceBatchAccessRequest(mockStripe(paidSession()), request);
    assert.equal(response.kind, "redirect");
    if (response.kind !== "redirect") return;
    assert.match(response.location, /\/invoicebatch\/app/);
    assert.ok(response.token);
    assert.ok(verifyAccessToken(response.token, SECRET));
  });

  it("does not set a cookie for an unpaid session", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const request = new Request(
      `${ORIGIN}/api/invoicebatch/access?session_id=cs_test_paid_invoicebatch`,
      { headers: { host: "digital-packs.vercel.app", "x-forwarded-proto": "https" } },
    );
    const response = await handleInvoiceBatchAccessRequest(
      mockStripe(paidSession({ payment_status: "unpaid" })),
      request,
    );
    assert.equal(response.kind, "redirect");
    if (response.kind !== "redirect") return;
    assert.match(response.location, /error=unpaid/);
    assert.equal(response.token, undefined);
  });

  it("does not set a cookie for the wrong price", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const request = new Request(
      `${ORIGIN}/api/invoicebatch/access?session_id=cs_test_paid_invoicebatch`,
      { headers: { host: "digital-packs.vercel.app", "x-forwarded-proto": "https" } },
    );
    const response = await handleInvoiceBatchAccessRequest(
      mockStripe(
        paidSession({
          metadata: {},
          line_items: { data: [{ price: { id: "price_other_sku" } }] },
        }),
      ),
      request,
    );
    assert.equal(response.kind, "redirect");
    if (response.kind !== "redirect") return;
    assert.match(response.location, /error=wrong_sku/);
    assert.equal(response.token, undefined);
  });

  it("rejects a forged magic-link token", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const real = signAccessToken({ sessionId: "cs_test_paid_invoicebatch" }, SECRET);
    const [body] = real.split(".");
    const forged = `${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    const request = new Request(
      `${ORIGIN}/api/invoicebatch/access?token=${encodeURIComponent(forged)}`,
      { headers: { host: "digital-packs.vercel.app", "x-forwarded-proto": "https" } },
    );
    const response = await handleInvoiceBatchAccessRequest(mockStripe(paidSession()), request);
    assert.equal(response.kind, "redirect");
    if (response.kind !== "redirect") return;
    assert.match(response.location, /error=invalid_token/);
    assert.equal(response.token, undefined);
  });
});

describe("handleInvoiceBatchRestoreRequest", () => {
  const previousSecret = process.env.INVOICEBATCH_ACCESS_SECRET;

  afterEach(() => {
    restoreEnv("INVOICEBATCH_ACCESS_SECRET", previousSecret);
  });

  it("restores access from a paid session id", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const request = new Request(`${ORIGIN}/api/invoicebatch/restore`, {
      method: "POST",
      headers: {
        host: "digital-packs.vercel.app",
        "x-forwarded-proto": "https",
        origin: ORIGIN,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ session_id: "cs_test_paid_invoicebatch" }),
    });
    const response = await handleInvoiceBatchRestoreRequest(mockStripe(paidSession()), request);
    assert.equal(response.kind, "json");
    if (response.kind !== "json") return;
    assert.equal(response.status, 200);
    assert.ok(response.token);
    assert.ok(verifyAccessToken(response.token, SECRET));
  });

  it("restores access from the checkout email", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const request = new Request(`${ORIGIN}/api/invoicebatch/restore`, {
      method: "POST",
      headers: {
        host: "digital-packs.vercel.app",
        "x-forwarded-proto": "https",
        origin: ORIGIN,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email: "buyer@example.com" }),
    });
    const response = await handleInvoiceBatchRestoreRequest(mockStripe(paidSession()), request);
    assert.equal(response.kind, "json");
    if (response.kind !== "json") return;
    assert.equal(response.status, 200);
    assert.ok(response.token);
  });

  it("rejects restore by email when no paid InvoiceBatch session exists", async () => {
    process.env.INVOICEBATCH_ACCESS_SECRET = SECRET;
    const result = await findPaidInvoiceBatchSessionByEmail(
      mockStripe(null),
      "nobody@example.com",
    );
    assert.equal(result.ok, false);
  });
});
