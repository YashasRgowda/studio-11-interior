// "+91 74839 84415" or "7483984415" -> "917483984415" for tel: and wa.me links.
export function phoneDigits(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export const telHref = (phone: string) => `tel:+${phoneDigits(phone)}`;

export const waHref = (whatsapp: string, text: string) =>
  `https://wa.me/${phoneDigits(whatsapp)}?text=${encodeURIComponent(text)}`;

export const MESSAGES = {
  consult: "Hi Studio 11, I would like a free consultation for my home interiors.",
  question: "Hi Studio 11, I have a question about interiors.",
  suggest: "Hi Studio 11, I am not sure what I need. Can you help me?",
  about: (service: string) => `Hi Studio 11, I would like to know more about ${service}.`,
};

// The website credit in the footer.
export const SVAYAM_WA = `https://wa.me/918095762180?text=${encodeURIComponent(
  "Hi svayam.ai, I saw the Studio 11 Interior website and I would love a website like this for my business.",
)}`;
