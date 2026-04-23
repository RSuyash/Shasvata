import { describe, expect, it } from "vitest";
import {
  formatCheckoutPhoneDisplay,
  sanitizeCheckoutPhoneInput,
} from "./checkout-identity";

describe("checkout identity phone helpers", () => {
  it("formats stored Indian numbers for calm display", () => {
    expect(formatCheckoutPhoneDisplay("919876543210")).toBe("+91 98765 43210");
    expect(formatCheckoutPhoneDisplay("9876543210")).toBe("98765 43210");
  });

  it("cleans pasted mobile numbers without making the user fight formatting", () => {
    expect(sanitizeCheckoutPhoneInput("+91-98765 43210")).toBe("+91 98765 43210");
    expect(sanitizeCheckoutPhoneInput("98765-43210")).toBe("98765 43210");
    expect(sanitizeCheckoutPhoneInput("  +91 (98765) 43210  ")).toBe("+91 98765 43210");
  });

  it("keeps incomplete values editable while still stripping noise", () => {
    expect(sanitizeCheckoutPhoneInput("+91 98")).toBe("+9198");
    expect(sanitizeCheckoutPhoneInput("98ab")).toBe("98");
    expect(sanitizeCheckoutPhoneInput("")).toBe("");
  });
});
