import { describe, expect, it } from "vitest";
import { buildStackSegmentHeights } from "./client-portal-panels";

describe("buildStackSegmentHeights", () => {
  it("normalizes visible stack heights to the column total", () => {
    expect(
      buildStackSegmentHeights([
        { value: 24, tone: "indigo" },
        { value: 12, tone: "blue" },
        { value: 4, tone: "cyan" },
      ]),
    ).toEqual([60, 30, 10]);
  });

  it("returns zero heights when the column has no visible values", () => {
    expect(
      buildStackSegmentHeights([
        { value: 0, tone: "indigo" },
        { value: 0, tone: "blue" },
      ]),
    ).toEqual([0, 0]);
  });
});
