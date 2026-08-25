export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(new Uint8Array(sig));
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7日間

export async function createSessionCookie(
  email: string,
  secret: string
): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${exp}`;
  const sig = await sign(payload, secret);
  return `${btoa(payload)}.${sig}`;
}

export async function verifySessionCookie(
  cookieValue: string | undefined,
  secret: string
): Promise<string | null> {
  if (!cookieValue) return null;
  const [payloadB64, sig] = cookieValue.split(".");
  if (!payloadB64 || !sig) return null;

  let payload: string;
  try {
    payload = atob(payloadB64);
  } catch {
    return null;
  }

  const expectedSig = await sign(payload, secret);
  if (!timingSafeEqual(expectedSig, sig)) return null;

  const [email, expStr] = payload.split("|");
  const exp = Number(expStr);
  if (!email || !exp || Date.now() > exp) return null;

  return email;
}
