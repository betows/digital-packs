import { createHmac, timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_MAX_AGE_SECONDS,
  ACCESS_PATH,
  APP_PATH,
  INVOICEBATCH_SKU,
} from "./invoicebatch-access-constants.ts";
import { assertPaidSessionForSku } from "./entitlement.ts";
import { getLiveProduct, getStripePriceId } from "./products.ts";
import { getRequestOrigin } from "./stripe.ts";

export {
  ACCESS_COOKIE_NAME,
  ACCESS_MAX_AGE_SECONDS,
  ACCESS_PATH,
  APP_PATH,
  INVOICEBATCH_SKU,
  RESTORE_PATH,
} from "./invoicebatch-access-constants.ts";

export type AccessPayload = {
  v: 1;
  sku: typeof INVOICEBATCH_SKU;
  sid: string;
  email: string;
  exp: number;
};

export type AccessGrant = {
  token: string;
  sessionId: string;
  email: string;
};

export type AccessFailure = {
  ok: false;
  status: 400 | 403 | 500;
  error: string;
  code: "missing" | "unpaid" | "wrong_sku" | "invalid_token" | "secret" | "not_found" | "stripe";
};

export type AccessSuccess = { ok: true } & AccessGrant;

export type StripeAccessClient = {
  checkout: {
    sessions: {
      retrieve: Stripe["checkout"]["sessions"]["retrieve"];
      list: Stripe["checkout"]["sessions"]["list"];
      search?: (params: {
        query: string;
        limit?: number;
        expand?: string[];
      }) => Promise<{ data: Stripe.Checkout.Session[] }>;
    };
  };
  customers: {
    list: Stripe["customers"]["list"];
  };
};

function invoiceBatchMatch(product = getLiveProduct(INVOICEBATCH_SKU)) {
  if (!product) {
    throw new Error("InvoiceBatch SKU is missing from the catalog");
  }
  return {
    product,
    priceId: getStripePriceId(product),
    paymentLinkId: product.stripePaymentLinkId,
  };
}

export function getInvoiceBatchAccessSecret(): string {
  const dedicated = process.env.INVOICEBATCH_ACCESS_SECRET?.trim();
  if (dedicated) return dedicated;
  const stripe = process.env.STRIPE_SECRET_KEY?.trim();
  if (stripe) return stripe;
  throw new Error("INVOICEBATCH_ACCESS_SECRET is not set");
}

export function accessCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  };
}

function encodeBody(payload: AccessPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function signaturesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signAccessToken(
  input: { sessionId: string; email?: string | null; expiresInSeconds?: number },
  secret: string = getInvoiceBatchAccessSecret(),
): string {
  const payload: AccessPayload = {
    v: 1,
    sku: INVOICEBATCH_SKU,
    sid: input.sessionId,
    email: input.email?.trim() ?? "",
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? ACCESS_MAX_AGE_SECONDS),
  };
  const body = encodeBody(payload);
  return `${body}.${signBody(body, secret)}`;
}

export function verifyAccessToken(
  token: string | null | undefined,
  secret: string = getInvoiceBatchAccessSecret(),
  nowSeconds: number = Math.floor(Date.now() / 1000),
): AccessPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;
  let expected: string;
  try {
    expected = signBody(body, secret);
  } catch {
    return null;
  }
  if (!signaturesMatch(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AccessPayload;
    if (payload.v !== 1 || payload.sku !== INVOICEBATCH_SKU) return null;
    if (typeof payload.sid !== "string" || !payload.sid) return null;
    if (typeof payload.exp !== "number" || payload.exp < nowSeconds) return null;
    return {
      v: 1,
      sku: INVOICEBATCH_SKU,
      sid: payload.sid,
      email: typeof payload.email === "string" ? payload.email : "",
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function sessionEmail(session: {
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
}): string {
  return session.customer_details?.email?.trim() || session.customer_email?.trim() || "";
}

export function normalizeRestoreEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length < 5 || email.length > 254) return null;
  if (email.includes('"') || email.includes("'") || email.includes(" ")) return null;
  if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i.test(email)) return null;
  return email;
}

function grantFromSession(session: { id?: string | null }): AccessSuccess {
  const sessionId = session.id?.trim() ?? "";
  const token = signAccessToken({
    sessionId,
    email: sessionEmail(session as { customer_email?: string | null; customer_details?: { email?: string | null } | null }),
  });
  return {
    ok: true,
    token,
    sessionId,
    email: sessionEmail(session as { customer_email?: string | null; customer_details?: { email?: string | null } | null }),
  };
}

export async function verifyPaidInvoiceBatchSession(
  stripe: StripeAccessClient,
  sessionId: string,
): Promise<AccessSuccess | AccessFailure> {
  const id = sessionId.trim();
  if (!id) {
    return { ok: false, status: 400, error: "Missing checkout session", code: "missing" };
  }

  let secretOk = true;
  try {
    getInvoiceBatchAccessSecret();
  } catch {
    secretOk = false;
  }
  if (!secretOk) {
    return {
      ok: false,
      status: 500,
      error: "INVOICEBATCH_ACCESS_SECRET is not set",
      code: "secret",
    };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["line_items.data.price"],
    });
  } catch {
    return {
      ok: false,
      status: 403,
      error: "Checkout session not found",
      code: "not_found",
    };
  }

  const { product, priceId, paymentLinkId } = invoiceBatchMatch();
  if (session.payment_status !== "paid") {
    return { ok: false, status: 403, error: "Payment not completed", code: "unpaid" };
  }
  const entitlement = assertPaidSessionForSku(session, product.sku, {
    priceId,
    paymentLinkId,
  });
  if (!entitlement.ok) {
    return { ok: false, status: 403, error: entitlement.error, code: "wrong_sku" };
  }

  return grantFromSession(session);
}

async function sessionIfInvoiceBatch(
  stripe: StripeAccessClient,
  session: Stripe.Checkout.Session | null | undefined,
): Promise<Stripe.Checkout.Session | null> {
  if (!session?.id) return null;
  const full =
    session.line_items?.data?.length
      ? session
      : await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items.data.price"],
        });
  const { product, priceId, paymentLinkId } = invoiceBatchMatch();
  if (full.payment_status !== "paid") return null;
  const entitlement = assertPaidSessionForSku(full, product.sku, {
    priceId,
    paymentLinkId,
  });
  return entitlement.ok ? full : null;
}

export async function findPaidInvoiceBatchSessionByEmail(
  stripe: StripeAccessClient,
  emailInput: string,
): Promise<AccessSuccess | AccessFailure> {
  const email = normalizeRestoreEmail(emailInput);
  if (!email) {
    return { ok: false, status: 400, error: "Enter a valid email", code: "missing" };
  }

  const consider = async (session: Stripe.Checkout.Session | null | undefined) =>
    sessionIfInvoiceBatch(stripe, session);

  try {
    const listed = await stripe.checkout.sessions.list({
      customer_details: { email },
      limit: 20,
      expand: ["data.line_items.data.price"],
    } as Parameters<StripeAccessClient["checkout"]["sessions"]["list"]>[0]);
    for (const session of listed.data) {
      const match = await consider(session);
      if (match) return grantFromSession(match);
    }
  } catch {
    // Some Stripe accounts do not filter list() by customer_details.email.
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 10 });
    for (const customer of customers.data) {
      const listed = await stripe.checkout.sessions.list({
        customer: customer.id,
        status: "complete",
        limit: 20,
        expand: ["data.line_items.data.price"],
      });
      for (const session of listed.data) {
        const match = await consider(session);
        if (match) return grantFromSession(match);
      }
    }
  } catch {
    // Continue to Search API.
  }

  try {
    const search = stripe.checkout.sessions.search;
    if (typeof search === "function") {
      const found = await search({
        query: `customer_details.email:"${email}" AND payment_status:"paid"`,
        limit: 20,
        expand: ["data.line_items.data.price"],
      });
      for (const session of found.data) {
        const match = await consider(session);
        if (match) return grantFromSession(match);
      }
    }
  } catch {
    // Search API is optional.
  }

  return {
    ok: false,
    status: 403,
    error: "No paid InvoiceBatch purchase found for that email",
    code: "not_found",
  };
}

export type AccessHttpRedirect = {
  kind: "redirect";
  location: string;
  token?: string;
};

export type AccessHttpJson = {
  kind: "json";
  status: number;
  body: Record<string, unknown>;
  token?: string;
};

export type AccessHttpResult = AccessHttpRedirect | AccessHttpJson;

export function accessErrorRedirect(origin: string, code: AccessFailure["code"]): AccessHttpRedirect {
  const url = new URL("/invoicebatch/success", origin);
  url.searchParams.set("error", code);
  return { kind: "redirect", location: url.toString() };
}

export function accessAppRedirect(origin: string, token: string): AccessHttpRedirect {
  const url = new URL(APP_PATH, origin);
  url.searchParams.set("welcome", "1");
  return { kind: "redirect", location: url.toString(), token };
}

export function bookmarkAccessUrl(origin: string, token: string): string {
  const url = new URL(ACCESS_PATH, origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function readCookieToken(request: Request): string {
  const raw = request.headers.get("cookie") ?? "";
  const parts = raw.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${ACCESS_COOKIE_NAME}=`)) {
      return decodeURIComponent(part.slice(ACCESS_COOKIE_NAME.length + 1));
    }
  }
  return "";
}

export async function handleInvoiceBatchAccessRequest(
  stripe: StripeAccessClient,
  request: Request,
): Promise<AccessHttpResult> {
  const origin = getRequestOrigin(request);
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
  const tokenParam = url.searchParams.get("token")?.trim() ?? "";

  try {
    if (sessionId) {
      const result = await verifyPaidInvoiceBatchSession(stripe, sessionId);
      if (!result.ok) return accessErrorRedirect(origin, result.code);
      return accessAppRedirect(origin, result.token);
    }

    if (tokenParam) {
      const payload = verifyAccessToken(tokenParam);
      if (!payload) return accessErrorRedirect(origin, "invalid_token");
      return accessAppRedirect(origin, tokenParam);
    }

    const cookieToken = readCookieToken(request);
    if (verifyAccessToken(cookieToken)) {
      return { kind: "redirect", location: new URL(APP_PATH, origin).toString() };
    }

    return accessErrorRedirect(origin, "missing");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("INVOICEBATCH_ACCESS_SECRET") || message.includes("STRIPE_SECRET_KEY")) {
      return accessErrorRedirect(origin, "secret");
    }
    return accessErrorRedirect(origin, "stripe");
  }
}

async function parseRestoreBody(request: Request): Promise<{ sessionId: string; email: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { session_id?: unknown; sessionId?: unknown; email?: unknown };
    const sessionId =
      (typeof body.session_id === "string" && body.session_id) ||
      (typeof body.sessionId === "string" && body.sessionId) ||
      "";
    const email = typeof body.email === "string" ? body.email : "";
    return { sessionId, email };
  }
  const form = await request.formData();
  const sessionId = String(form.get("session_id") ?? form.get("sessionId") ?? "");
  const email = String(form.get("email") ?? "");
  return { sessionId, email };
}

export async function handleInvoiceBatchRestoreRequest(
  stripe: StripeAccessClient,
  request: Request,
): Promise<AccessHttpResult> {
  const origin = getRequestOrigin(request);
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== origin) {
    return { kind: "json", status: 403, body: { error: "Invalid origin" } };
  }

  let sessionId = "";
  let email = "";
  try {
    ({ sessionId, email } = await parseRestoreBody(request));
  } catch {
    return { kind: "json", status: 400, body: { error: "Invalid body" } };
  }

  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const fail = (result: AccessFailure): AccessHttpResult => {
    if (wantsJson) {
      return {
        kind: "json",
        status: result.status,
        body: { error: result.error, code: result.code },
      };
    }
    return accessErrorRedirect(origin, result.code);
  };

  try {
    if (sessionId.trim()) {
      const result = await verifyPaidInvoiceBatchSession(stripe, sessionId);
      if (!result.ok) return fail(result);
      if (wantsJson) {
        return { kind: "json", status: 200, body: { ok: true, redirect: APP_PATH }, token: result.token };
      }
      return accessAppRedirect(origin, result.token);
    }
    if (email.trim()) {
      const result = await findPaidInvoiceBatchSessionByEmail(stripe, email);
      if (!result.ok) return fail(result);
      if (wantsJson) {
        return { kind: "json", status: 200, body: { ok: true, redirect: APP_PATH }, token: result.token };
      }
      return accessAppRedirect(origin, result.token);
    }
    return fail({
      ok: false,
      status: 400,
      error: "Enter a checkout session id or the email used at checkout",
      code: "missing",
    });
  } catch {
    return fail({
      ok: false,
      status: 500,
      error: "Could not look up that purchase",
      code: "stripe",
    });
  }
}

export const ACCESS_ERROR_COPY: Record<AccessFailure["code"], { title: string; body: string }> = {
  missing: {
    title: "Missing checkout session",
    body: "This page only unlocks InvoiceBatch after a paid Stripe Checkout session. Use Restore access on the app if you already paid.",
  },
  unpaid: {
    title: "Payment not confirmed",
    body: "Stripe has not marked this session as paid. InvoiceBatch stays gated until payment_status is paid.",
  },
  wrong_sku: {
    title: "This purchase is not InvoiceBatch",
    body: "The Checkout session is paid, but it does not match the InvoiceBatch price or Payment Link. The browser app stays locked.",
  },
  invalid_token: {
    title: "Access link is invalid",
    body: "That restore link is expired, incomplete, or was not signed by this site. Enter your checkout session id or email instead.",
  },
  secret: {
    title: "Server is missing the access secret",
    body: "INVOICEBATCH_ACCESS_SECRET is not configured. Payment can succeed, but this app cannot mint an access cookie until that env var is set.",
  },
  not_found: {
    title: "No matching InvoiceBatch purchase",
    body: "Stripe did not find a paid InvoiceBatch Checkout session for that id or email. Check the cs_… id from your receipt, or the email entered at checkout.",
  },
  stripe: {
    title: "Could not verify checkout",
    body: "The session could not be retrieved from Stripe. InvoiceBatch stays gated until payment is confirmed.",
  },
};
