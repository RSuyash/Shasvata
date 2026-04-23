import crypto from "node:crypto";

export function verifyCashfreeWebhookSignature(input: {
  rawBody: string;
  secret: string;
  timestamp: string;
  signature: string;
}): boolean {
  if (!input.rawBody || !input.secret || !input.timestamp || !input.signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", input.secret)
    .update(`${input.timestamp}${input.rawBody}`)
    .digest("base64");

  const signatureBuffer = Buffer.from(input.signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
