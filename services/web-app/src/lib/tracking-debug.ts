export const TRACKING_DEBUG_QUERY_KEY = "nayaTrackingDebug";

function normalizeUrl(input: string): URL | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value.replace(/^https?:\/\//i, "")}`);
    } catch {
      return null;
    }
  }
}

export function buildTrackingDebugUrl(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const url = normalizeUrl(input);
  if (!url) {
    return null;
  }

  url.searchParams.set(TRACKING_DEBUG_QUERY_KEY, "1");
  return url.toString();
}
