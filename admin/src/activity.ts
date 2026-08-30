import type { ActivityEntry } from "./types";

const PREFIX = "activity:";
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90日で自動的に消える

export async function logActivity(
  env: { DATA: KVNamespace },
  actor: string,
  action: string,
  detail: string
): Promise<void> {
  const at = Date.now();
  const key = `${PREFIX}${at}:${crypto.randomUUID()}`;
  await env.DATA.put(key, JSON.stringify({ at, actor, action, detail }), {
    expirationTtl: TTL_SECONDS,
  });
}

export async function listActivity(
  env: { DATA: KVNamespace },
  limit = 100
): Promise<ActivityEntry[]> {
  const { keys } = await env.DATA.list({ prefix: PREFIX });
  const recentKeys = keys.slice(-limit);
  const values = await Promise.all(
    recentKeys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<ActivityEntry, "key">;
      return { ...parsed, key: k.name } as ActivityEntry;
    })
  );
  return values
    .filter((v): v is ActivityEntry => v !== null)
    .sort((a, b) => b.at - a.at);
}
