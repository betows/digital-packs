import { getStripePriceId, type Product } from "./products";
import { safeRelativePath, utmToMetadata, type UtmParams } from "./utm";

export function buildCheckoutSessionParams(
  product: Product,
  origin: string,
  options?: { utm?: UtmParams; cancelPath?: string },
) {
  const cancelPath = safeRelativePath(options?.cancelPath);
  return {
    mode: "payment" as const,
    line_items: [{ price: getStripePriceId(product), quantity: 1 }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
    allow_promotion_codes: true,
    metadata: {
      sku: product.sku,
      ...utmToMetadata(options?.utm ?? {}),
    },
  };
}
