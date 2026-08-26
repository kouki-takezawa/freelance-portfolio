const TRASH_PREFIX = "trash:";
const TRASH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日後に自動で完全削除

export type TrashItem = {
  key: string;
  kind: "inquiry" | "order";
  originalKey: string;
  deletedAt: number;
  summary: string;
};

export async function moveToTrash(
  env: { DATA: KVNamespace },
  kind: "inquiry" | "order",
  originalKey: string,
  summary: string,
  rawValue: string
): Promise<void> {
  const trashKey = `${TRASH_PREFIX}${kind}:${originalKey}`;
  await env.DATA.put(
    trashKey,
    JSON.stringify({ kind, originalKey, deletedAt: Date.now(), summary, rawValue }),
    { expirationTtl: TRASH_TTL_SECONDS }
  );
  await env.DATA.delete(originalKey);
}

export async function listTrash(env: { DATA: KVNamespace }): Promise<TrashItem[]> {
  const { keys } = await env.DATA.list({ prefix: TRASH_PREFIX });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<TrashItem, "key">;
      return { ...parsed, key: k.name } as TrashItem;
    })
  );
  return values.filter((v): v is TrashItem => v !== null).sort((a, b) => b.deletedAt - a.deletedAt);
}

export async function restoreFromTrash(env: { DATA: KVNamespace }, trashKey: string): Promise<void> {
  const raw = await env.DATA.get(trashKey);
  if (!raw) return;
  const parsed = JSON.parse(raw) as { originalKey: string; rawValue: string };
  await env.DATA.put(parsed.originalKey, parsed.rawValue);
  await env.DATA.delete(trashKey);
}

export async function purgeTrash(env: { DATA: KVNamespace }, trashKey: string): Promise<void> {
  await env.DATA.delete(trashKey);
}
