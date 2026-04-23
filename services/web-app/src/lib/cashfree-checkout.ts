import type { CheckoutSessionResponse } from "./commerce";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (input: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank";
      }) => Promise<unknown>;
    };
  }
}

let cashfreeScriptPromise: Promise<void> | null = null;

export function loadCashfreeCheckoutSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree checkout is only available in the browser."));
  }

  if (window.Cashfree) {
    return Promise.resolve();
  }

  if (cashfreeScriptPromise) {
    return cashfreeScriptPromise;
  }

  cashfreeScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Cashfree checkout SDK failed to load."));
    document.head.appendChild(script);
  });

  return cashfreeScriptPromise;
}

export async function launchCashfreeCheckout(session: CheckoutSessionResponse) {
  if (session.hostedCheckoutUrl) {
    window.location.href = session.hostedCheckoutUrl;
    return;
  }

  if (!session.paymentSessionId) {
    throw new Error("Payment session is not ready yet.");
  }

  await loadCashfreeCheckoutSdk();

  if (!window.Cashfree) {
    throw new Error("Cashfree checkout SDK is unavailable.");
  }

  const cashfree = window.Cashfree({
    mode: session.environment === "PRODUCTION" ? "production" : "sandbox",
  });

  await cashfree.checkout({
    paymentSessionId: session.paymentSessionId,
    redirectTarget: "_self",
  });
}
