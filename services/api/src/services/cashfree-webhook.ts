import { processCashfreeWebhook as processCashfreeWebhookEvent } from "./commerce.js";

export async function processCashfreeWebhook(input: {
  rawBody: string;
  headers: Headers | Record<string, string | string[] | undefined>;
}) {
  return processCashfreeWebhookEvent(input);
}
