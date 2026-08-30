import type { SnsPlatform, SnsPost } from "./types";

const PREFIX = "sns:";

export async function createSnsPost(
  env: { DATA: KVNamespace },
  post: { platform: SnsPlatform; caption: string; body: string }
): Promise<SnsPost> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const key = `${PREFIX}${createdAt}:${id}`;
  const value: Omit<SnsPost, "key"> = {
    id,
    platform: post.platform,
    caption: post.caption,
    body: post.body,
    status: "draft",
    createdAt,
  };
  await env.DATA.put(key, JSON.stringify(value));
  return { ...value, key };
}

export async function listSnsPosts(env: { DATA: KVNamespace }): Promise<SnsPost[]> {
  const { keys } = await env.DATA.list({ prefix: PREFIX });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<SnsPost, "key">;
      return { ...parsed, key: k.name } as SnsPost;
    })
  );
  return values
    .filter((v): v is SnsPost => v !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function markSnsPostPosted(env: { DATA: KVNamespace }, key: string): Promise<void> {
  const raw = await env.DATA.get(key);
  if (!raw) return;
  const post = JSON.parse(raw) as Omit<SnsPost, "key">;
  await env.DATA.put(key, JSON.stringify({ ...post, status: "posted" }));
}

export async function deleteSnsPost(env: { DATA: KVNamespace }, key: string): Promise<void> {
  await env.DATA.delete(key);
}
