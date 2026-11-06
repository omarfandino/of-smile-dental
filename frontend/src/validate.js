// Convenience validation; the backend is the authority.
export function validate({ name, whatsapp, email }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Enter the patient's name";
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15)
    errors.whatsapp = "Enter the full WhatsApp number (10 digits, or with country code)";
  if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
    errors.email = "That email doesn't look valid (e.g. name@email.com)";
  return errors;
}

export function formatWhatsapp(n) {
  // 573001234567 -> +57 300 123 4567
  if (n.length === 12) return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
  return `+${n}`;
}
