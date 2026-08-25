import type { SocialPost } from "../types";

const PREFIX = "social_post:";

export async function listSocialPosts(env: { DATA: KVNamespace }): Promise<SocialPost[]> {
  const { keys } = await env.DATA.list({ prefix: PREFIX });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<SocialPost, "key">;
      return { ...parsed, key: k.name } as SocialPost;
    })
  );
  return values
    .filter((v): v is SocialPost => v !== null)
    .sort((a, b) => b.scheduledAt - a.scheduledAt);
}

export async function getSocialPost(
  env: { DATA: KVNamespace },
  key: string
): Promise<SocialPost | null> {
  const raw = await env.DATA.get(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Omit<SocialPost, "key">;
  return { ...parsed, key };
}

export async function putSocialPost(
  env: { DATA: KVNamespace },
  post: SocialPost
): Promise<void> {
  const { key, ...value } = post;
  await env.DATA.put(key, JSON.stringify(value));
}

export async function createSocialPost(
  env: { DATA: KVNamespace },
  post: Omit<SocialPost, "key">
): Promise<string> {
  // scheduledAtを先頭に含めることで、KVのlist()がそのまま時系列順になる
  const key = `${PREFIX}${post.scheduledAt}:${post.id}`;
  await env.DATA.put(key, JSON.stringify(post));
  return key;
}

export async function deleteSocialPost(env: { DATA: KVNamespace }, key: string): Promise<void> {
  await env.DATA.delete(key);
}

export async function listDueSocialPosts(
  env: { DATA: KVNamespace },
  now: number
): Promise<SocialPost[]> {
  const all = await listSocialPosts(env);
  return all.filter((p) => p.status === "scheduled" && p.scheduledAt <= now);
}
