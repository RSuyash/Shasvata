export function formatCheckoutPhoneDisplay(phone: string | null): string {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  if (phone.startsWith("+")) {
    return phone;
  }

  return digits || phone;
}

export function sanitizeCheckoutPhoneInput(value: string): string {
  const trimmed = value.trim();
  const keepPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return keepPlus ? "+" : "";
  }

  if (digits.length >= 12 && digits.startsWith("91")) {
    const national = digits.slice(2, 12);
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`.trim();
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  if (keepPlus) {
    return `+${digits}`;
  }

  return digits;
}
