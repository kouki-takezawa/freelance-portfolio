const ADMIN_ACCOUNT_KEY = "auth:admin";
const PBKDF2_ITERATIONS = 600000;

// sessionEpochは、パスワード/ログインID変更のたびにインクリメントする「世代」番号。
// 発行済みのセッションCookieにも同じ値を埋め込み、検証時に一致しなければ強制ログアウトする
// (盗まれたCookieが変更後も残り続けるのを防ぐ)。既存レコードに無い場合は0として扱う。
export type AdminAccount = { email: string; passwordHash: string; sessionEpoch?: number };

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterStr, saltHex, hashHex] = stored.split(":");
  const iterations = Number(iterStr);
  if (!iterations || !saltHex || !hashHex) return false;
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return timingSafeEqual(toHex(new Uint8Array(bits)), hashHex);
}

// ログイン情報はKVに保存する(auth:admin)。初回アクセス時のみ、Workers Secretsの
// ADMIN_EMAIL/ADMIN_PASSWORDから移行する(設定画面からの変更はKV側のみを更新する)。
export async function getAdminAccount(env: {
  DATA: KVNamespace;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}): Promise<AdminAccount> {
  const raw = await env.DATA.get(ADMIN_ACCOUNT_KEY);
  if (raw) return JSON.parse(raw) as AdminAccount;
  const seeded: AdminAccount = {
    email: env.ADMIN_EMAIL,
    passwordHash: await hashPassword(env.ADMIN_PASSWORD),
    sessionEpoch: 0,
  };
  await env.DATA.put(ADMIN_ACCOUNT_KEY, JSON.stringify(seeded));
  return seeded;
}

export async function setAdminAccount(
  env: { DATA: KVNamespace },
  account: AdminAccount
): Promise<void> {
  await env.DATA.put(ADMIN_ACCOUNT_KEY, JSON.stringify(account));
}

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

export type SessionInfo = { email: string; epoch: number };

export async function createSessionCookie(
  email: string,
  secret: string,
  epoch: number
): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${exp}|${epoch}`;
  const sig = await sign(payload, secret);
  return `${btoa(payload)}.${sig}`;
}

export async function verifySessionCookie(
  cookieValue: string | undefined,
  secret: string
): Promise<SessionInfo | null> {
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

  const [email, expStr, epochStr] = payload.split("|");
  const exp = Number(expStr);
  if (!email || !exp || Date.now() > exp) return null;
  // epochStrが無い(移行前に発行された)Cookieはepoch 0として扱う
  const epoch = epochStr === undefined ? 0 : Number(epochStr);
  if (!Number.isFinite(epoch)) return null;

  return { email, epoch };
}
