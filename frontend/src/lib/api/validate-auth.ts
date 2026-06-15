const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return "Ogiltig e-postadress.";
  }
  const email = value.trim();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return "Ogiltig e-postadress.";
  }
  return null;
}

export function validatePassword(value: unknown, label = "Lösenord"): string | null {
  if (typeof value !== "string") {
    return `${label} krävs.`;
  }
  if (value.length < 6) {
    return `${label} måste vara minst 6 tecken.`;
  }
  if (value.length > 128) {
    return `${label} får vara högst 128 tecken.`;
  }
  return null;
}

export function validateRegistrationFields(body: Record<string, unknown>): string | null {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";

  if (!name || name.length > 100) {
    return "Namn krävs (högst 100 tecken).";
  }
  if (!username || username.length > 50) {
    return "Användarnamn krävs (högst 50 tecken).";
  }
  return validateEmail(body.email) ?? validatePassword(body.password);
}
