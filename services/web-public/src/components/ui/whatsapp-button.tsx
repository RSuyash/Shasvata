"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/content/site";

export function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hi, I'm reaching out regarding growth / systems / automation support for my business.",
  );
  const url = `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
    </a>
  );
}
