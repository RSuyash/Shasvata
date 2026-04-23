"use client";

import { siteConfig } from "@/content/site";

const DEFAULT_MESSAGE =
  "Hi, I'm reaching out regarding growth / systems / automation support for my business.";

/**
 * Returns a WhatsApp deep-link URL with a prefilled message.
 *
 * @example
 * const url = useWhatsAppUrl();
 * <a href={url}>Chat on WhatsApp</a>
 */
export function useWhatsAppUrl(message: string = DEFAULT_MESSAGE): string {
  const number = siteConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
