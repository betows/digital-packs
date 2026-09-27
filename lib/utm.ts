export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

const MAX_UTM_VALUE = 200;

function sanitizeUtmValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_UTM_VALUE);
}

export function pickUtmParams(
  source: URLSearchParams | Record<string, unknown> | null | undefined,
): UtmParams {
  if (!source) return {};

  const params: UtmParams = {};
  for (const key of UTM_KEYS) {
    const raw =
      source instanceof URLSearchParams
        ? source.get(key)
        : source[key];
    if (typeof raw !== "string") continue;
    const value = sanitizeUtmValue(raw);
    if (value) params[key] = value;
  }
  return params;
}

export function utmToMetadata(utm: UtmParams): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) metadata[key] = value;
  }
  return metadata;
}

export function safeRelativePath(path: unknown, fallback = "/"): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  if (path.includes("\\") || path.includes("\n") || path.includes("\r")) {
    return fallback;
  }
  return path;
}
