const OWNER = "kouki-takezawa";
const REPO = "freelance-hp";

function base64EncodeUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64DecodeUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "freelance-hp-admin",
    Accept: "application/vnd.github+json",
  };
}

export async function getJsonFile<T>(
  token: string,
  path: string
): Promise<{ sha: string; value: T }> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    { headers: githubHeaders(token) }
  );
  if (!res.ok) {
    throw new Error(`GitHubからの読み込みに失敗しました (${path}): ${res.status}`);
  }
  const data = (await res.json()) as { sha: string; content: string };
  const value = JSON.parse(base64DecodeUtf8(data.content)) as T;
  return { sha: data.sha, value };
}

export async function putJsonFile(
  token: string,
  path: string,
  value: unknown,
  sha: string,
  message: string
): Promise<void> {
  const content = base64EncodeUtf8(JSON.stringify(value, null, 2) + "\n");
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, content, sha, branch: "main" }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHubへの保存に失敗しました (${path}): ${res.status} ${text}`);
  }
}
