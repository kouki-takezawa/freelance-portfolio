import type { SocialPlatform, SocialPostResult } from "../types";

const IG_TOKEN_KV_KEY = "meta:ig_access_token";
const THREADS_TOKEN_KV_KEY = "meta:threads_access_token";

type MetaEnv = {
  DATA: KVNamespace;
  META_IG_ACCESS_TOKEN?: string;
  META_IG_USER_ID?: string;
  META_THREADS_ACCESS_TOKEN?: string;
  META_THREADS_USER_ID?: string;
};

export type MetaCredentials = {
  igAccessToken: string;
  igUserId: string;
  threadsAccessToken: string;
  threadsUserId: string;
};

// リフレッシュ後の最新トークンはKVに保存する(Workerは自分のシークレットを書き換えられないため)。
// KVに値が無ければデプロイ時にシークレットとして渡した初期トークンを使う。
export async function getMetaCredentials(env: MetaEnv): Promise<MetaCredentials> {
  const [igFromKv, threadsFromKv] = await Promise.all([
    env.DATA.get(IG_TOKEN_KV_KEY),
    env.DATA.get(THREADS_TOKEN_KV_KEY),
  ]);
  return {
    igAccessToken: igFromKv ?? env.META_IG_ACCESS_TOKEN ?? "",
    igUserId: env.META_IG_USER_ID ?? "",
    threadsAccessToken: threadsFromKv ?? env.META_THREADS_ACCESS_TOKEN ?? "",
    threadsUserId: env.META_THREADS_USER_ID ?? "",
  };
}

async function metaFetch(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; json: Record<string, unknown> }> {
  const res = await fetch(url, init);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, json };
}

function extractErrorMessage(json: Record<string, unknown>, fallback: string): string {
  const error = json.error as { message?: string } | undefined;
  return error?.message ?? fallback;
}

export async function publishToInstagram(
  creds: MetaCredentials,
  content: { imageUrl: string; caption: string }
): Promise<SocialPostResult> {
  const base = "https://graph.instagram.com/v21.0";
  try {
    const createParams = new URLSearchParams({
      image_url: content.imageUrl,
      caption: content.caption,
      access_token: creds.igAccessToken,
    });
    const create = await metaFetch(`${base}/${creds.igUserId}/media`, {
      method: "POST",
      body: createParams,
    });
    if (!create.ok || !create.json.id) {
      return {
        platform: "instagram",
        success: false,
        postId: "",
        error: extractErrorMessage(create.json, "コンテナ作成に失敗しました"),
      };
    }

    const publishParams = new URLSearchParams({
      creation_id: String(create.json.id),
      access_token: creds.igAccessToken,
    });
    const publish = await metaFetch(`${base}/${creds.igUserId}/media_publish`, {
      method: "POST",
      body: publishParams,
    });
    if (!publish.ok || !publish.json.id) {
      return {
        platform: "instagram",
        success: false,
        postId: "",
        error: extractErrorMessage(publish.json, "公開に失敗しました"),
      };
    }

    return { platform: "instagram", success: true, postId: String(publish.json.id), error: "" };
  } catch (err) {
    return {
      platform: "instagram",
      success: false,
      postId: "",
      error: (err as Error).message,
    };
  }
}

export async function publishToThreads(
  creds: MetaCredentials,
  content: { text: string; imageUrl?: string }
): Promise<SocialPostResult> {
  const base = "https://graph.threads.net/v1.0";
  try {
    const createParams = new URLSearchParams({
      text: content.text,
      access_token: creds.threadsAccessToken,
    });
    if (content.imageUrl) {
      createParams.set("media_type", "IMAGE");
      createParams.set("image_url", content.imageUrl);
    } else {
      createParams.set("media_type", "TEXT");
    }

    const create = await metaFetch(`${base}/${creds.threadsUserId}/threads`, {
      method: "POST",
      body: createParams,
    });
    if (!create.ok || !create.json.id) {
      return {
        platform: "threads",
        success: false,
        postId: "",
        error: extractErrorMessage(create.json, "コンテナ作成に失敗しました"),
      };
    }

    const publishParams = new URLSearchParams({
      creation_id: String(create.json.id),
      access_token: creds.threadsAccessToken,
    });
    const publish = await metaFetch(`${base}/${creds.threadsUserId}/threads_publish`, {
      method: "POST",
      body: publishParams,
    });
    if (!publish.ok || !publish.json.id) {
      return {
        platform: "threads",
        success: false,
        postId: "",
        error: extractErrorMessage(publish.json, "公開に失敗しました"),
      };
    }

    return { platform: "threads", success: true, postId: String(publish.json.id), error: "" };
  } catch (err) {
    return {
      platform: "threads",
      success: false,
      postId: "",
      error: (err as Error).message,
    };
  }
}

export async function publishSocialPost(
  creds: MetaCredentials,
  platforms: SocialPlatform[],
  content: { caption: string; imageUrl: string }
): Promise<SocialPostResult[]> {
  const results: SocialPostResult[] = [];
  if (platforms.includes("instagram")) {
    results.push(
      await publishToInstagram(creds, { imageUrl: content.imageUrl, caption: content.caption })
    );
  }
  if (platforms.includes("threads")) {
    results.push(
      await publishToThreads(creds, {
        text: content.caption,
        imageUrl: content.imageUrl || undefined,
      })
    );
  }
  return results;
}

const LAST_REFRESH_KV_KEY = "meta:token_last_refreshed_at";
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function refreshLongLivedToken(
  refreshUrl: string,
  token: string
): Promise<string | null> {
  if (!token) return null;
  try {
    const res = await fetch(`${refreshUrl}?grant_type=${refreshUrl.includes("threads") ? "th_refresh_token" : "ig_refresh_token"}&access_token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

// cronから定期的に呼び出し、期限が近い長期トークンを更新してKVに保存する。
// リフレッシュ自体は1日1回で十分なため、直近の実行時刻をKVで確認してから行う。
export async function refreshMetaTokensIfNeeded(env: MetaEnv): Promise<void> {
  const lastRefreshedAt = Number((await env.DATA.get(LAST_REFRESH_KV_KEY)) ?? "0");
  if (Date.now() - lastRefreshedAt < REFRESH_INTERVAL_MS) return;

  const creds = await getMetaCredentials(env);

  if (creds.igAccessToken) {
    const refreshed = await refreshLongLivedToken(
      "https://graph.instagram.com/refresh_access_token",
      creds.igAccessToken
    );
    if (refreshed) await env.DATA.put(IG_TOKEN_KV_KEY, refreshed);
  }

  if (creds.threadsAccessToken) {
    const refreshed = await refreshLongLivedToken(
      "https://graph.threads.net/refresh_access_token",
      creds.threadsAccessToken
    );
    if (refreshed) await env.DATA.put(THREADS_TOKEN_KV_KEY, refreshed);
  }

  await env.DATA.put(LAST_REFRESH_KV_KEY, String(Date.now()));
}
