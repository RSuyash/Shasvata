import { describe, expect, it } from "vitest";
import { TRACKING_DEBUG_QUERY_KEY, buildTrackingDebugUrl } from "./tracking-debug";

describe("buildTrackingDebugUrl", () => {
  it("adds the tracking debug query flag to a normal url", () => {
    expect(buildTrackingDebugUrl("https://wagholihighstreet.in")).toBe(
      `https://wagholihighstreet.in/?${TRACKING_DEBUG_QUERY_KEY}=1`,
    );
  });

  it("preserves existing query params while adding the debug flag", () => {
    expect(
      buildTrackingDebugUrl(
        "https://aakar-realities.preview.shasvata.com/?utm_source=test",
      ),
    ).toBe(
      `https://aakar-realities.preview.shasvata.com/?utm_source=test&${TRACKING_DEBUG_QUERY_KEY}=1`,
    );
  });

  it("normalizes host-like values into https debug urls", () => {
    expect(buildTrackingDebugUrl("wagholihighstreet.in")).toBe(
      `https://wagholihighstreet.in/?${TRACKING_DEBUG_QUERY_KEY}=1`,
    );
  });

  it("returns null for empty values", () => {
    expect(buildTrackingDebugUrl("")).toBeNull();
    expect(buildTrackingDebugUrl(null)).toBeNull();
  });
});
